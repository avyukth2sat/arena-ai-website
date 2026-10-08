import { CHAIN_BY_ID, classifyStore, regionForZip } from "@/lib/kb/stores";
import type { LocationInfo, StoreInfo, StoresResult } from "@/lib/types";

const UA = "Culturize/1.0 (cultural grocery substitution app)";
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

type CacheEntry = { at: number; ttl: number; value: StoresResult };
const globalCache = globalThis as typeof globalThis & { __culturizeStoreCache?: Map<string, CacheEntry> };
const cache = globalCache.__culturizeStoreCache ?? (globalCache.__culturizeStoreCache = new Map());

async function fetchJson<T>(
  url: string,
  init: Omit<RequestInit, "signal"> & { timeoutMs: number; signal?: AbortSignal },
): Promise<T | null> {
  const { timeoutMs, headers, signal, ...rest } = init;
  const timeout = AbortSignal.timeout(timeoutMs);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
      cache: "no-store",
      headers: { "User-Agent": UA, Accept: "application/json", ...(headers as Record<string, string> | undefined) },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function geocodeZip(zip: string): Promise<LocationInfo | null> {
  type Zippo = { places?: { "place name": string; latitude: string; longitude: string; "state abbreviation": string }[] };
  const data = await fetchJson<Zippo>(`https://api.zippopotam.us/us/${zip}`, { timeoutMs: 5000 });
  const place = data?.places?.[0];
  if (!place) return null;
  return {
    zip,
    label: `${place["place name"]}, ${place["state abbreviation"]}`,
    lat: parseFloat(place.latitude),
    lon: parseFloat(place.longitude),
  };
}

async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  type Nominatim = { address?: Record<string, string> };
  const data = await fetchJson<Nominatim>(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
    { timeoutMs: 5000 },
  );
  const a = data?.address ?? {};
  const city = a.city ?? a.town ?? a.village ?? a.suburb ?? a.hamlet ?? a.county;
  const state = (a["ISO3166-2-lvl4"] ?? "").replace("US-", "") || a.state;
  const zip = a.postcode?.slice(0, 5) ?? null;
  return {
    zip: zip && /^\d{5}$/.test(zip) ? zip : null,
    label: city ? `${city}${state ? `, ${state}` : ""}` : "Your location",
    lat,
    lon,
  };
}

function haversineMi(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
}

interface OsmElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function overpassQuery(lat: number, lon: number, radius: number): string {
  // Ethnic markets are overwhelmingly tagged shop=supermarket/greengrocer in OSM; keeping the
  // filter simple keeps the public Overpass servers fast.
  return `[out:json][timeout:9];nwr["shop"~"^(supermarket|greengrocer|wholesale|department_store)$"](around:${radius},${lat},${lon});out center tags;`;
}

/** Race the public Overpass mirrors and take the first good answer. */
async function queryOverpass(lat: number, lon: number, radius: number): Promise<OsmElement[] | null> {
  const body = new URLSearchParams({ data: overpassQuery(lat, lon, radius) }).toString();
  const controllers = OVERPASS_ENDPOINTS.map(() => new AbortController());
  const attempts = OVERPASS_ENDPOINTS.map(async (endpoint, i) => {
    const data = await fetchJson<{ elements?: OsmElement[] }>(endpoint, {
      method: "POST",
      body,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeoutMs: 8000,
      signal: controllers[i].signal,
    });
    if (!data?.elements) throw new Error("overpass: no data");
    return data.elements;
  });
  try {
    return await Promise.any(attempts);
  } catch {
    return null;
  } finally {
    controllers.forEach((c) => c.abort());
  }
}

function toStores(elements: OsmElement[], lat: number, lon: number): StoreInfo[] {
  const all: StoreInfo[] = [];
  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name ?? tags.brand;
    if (!name) continue;
    const cls = classifyStore(name, tags.brand, tags.shop);
    if (!cls) continue;
    const plat = el.lat ?? el.center?.lat;
    const plon = el.lon ?? el.center?.lon;
    if (plat == null || plon == null) continue;
    const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
    all.push({
      id: `osm-${el.type}-${el.id}`,
      name: cls.chain ? cls.chain.name : name,
      chain: cls.chain?.id ?? null,
      kind: cls.kind,
      tags: cls.tags,
      distanceMi: Math.round(haversineMi(lat, lon, plat, plon) * 10) / 10,
      address: street || tags["addr:city"] || null,
      source: "osm",
    });
  }
  all.sort((a, b) => (a.distanceMi ?? 0) - (b.distanceMi ?? 0));
  const seen = new Set<string>();
  return all.filter((s) => {
    const key = s.chain ?? s.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const MAINSTREAM = new Set(["supermarket", "big_box", "warehouse", "natural"]);

function selectStores(unique: StoreInfo[]): StoreInfo[] {
  const main = unique.filter((s) => MAINSTREAM.has(s.kind));
  const special = unique.filter((s) => !MAINSTREAM.has(s.kind));
  const picked: StoreInfo[] = main.filter((s) => s.chain).slice(0, 5);
  if (picked.length < 3) picked.push(...main.filter((s) => !s.chain).slice(0, 3 - picked.length));
  if (!picked.some((s) => s.kind === "natural")) {
    const natural = main.find((s) => s.kind === "natural");
    if (natural) picked.push(natural);
  }
  const kinds = new Set<string>();
  for (const s of special) {
    if (kinds.size >= 4) break;
    if (kinds.has(s.kind)) continue;
    kinds.add(s.kind);
    picked.push(s);
  }
  return picked.sort((a, b) => (a.distanceMi ?? 99) - (b.distanceMi ?? 99)).slice(0, 10);
}

export function regionalStores(zip: string | null): { stores: StoreInfo[]; regionLabel: string } {
  const region = regionForZip(zip);
  const stores = region.chains
    .map((id) => CHAIN_BY_ID[id])
    .filter(Boolean)
    .map(
      (chain): StoreInfo => ({
        id: `chain-${chain.id}`,
        name: chain.name,
        chain: chain.id,
        kind: chain.kind,
        tags: chain.tags,
        distanceMi: null,
        address: null,
        source: "regional",
      }),
    );
  return { stores, regionLabel: region.label };
}

/** Build a regional result without any network calls (used for seeding & fallbacks). */
export function regionalStoresResult(zip: string | null, label: string): StoresResult {
  const reg = regionalStores(zip);
  return {
    location: { zip, label, lat: null, lon: null },
    stores: reg.stores,
    source: "regional",
    note: `Based on grocery chains common in ${reg.regionLabel}. Share your exact location for store-by-store results.`,
  };
}

export async function findNearbyStores(input: {
  zip?: string | null;
  lat?: number | null;
  lon?: number | null;
}): Promise<StoresResult> {
  const zip = input.zip && /^\d{5}$/.test(input.zip) ? input.zip : null;
  const hasCoords =
    typeof input.lat === "number" && typeof input.lon === "number" && Number.isFinite(input.lat) && Number.isFinite(input.lon);

  const preKey = hasCoords ? `ll:${input.lat!.toFixed(3)},${input.lon!.toFixed(3)}` : `zip:${zip ?? "none"}`;
  const hit = cache.get(preKey);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.value;

  // Share one lookup between concurrent callers (e.g. the ZIP preview and a culturize request).
  const pending = inflight.get(preKey);
  if (pending) return pending;
  const task = computeStores(zip, hasCoords ? { lat: input.lat!, lon: input.lon! } : null, preKey).finally(() =>
    inflight.delete(preKey),
  );
  inflight.set(preKey, task);
  return task;
}

const inflight = new Map<string, Promise<StoresResult>>();

async function computeStores(
  zip: string | null,
  coords: { lat: number; lon: number } | null,
  preKey: string,
): Promise<StoresResult> {
  let location: LocationInfo | null = null;
  if (coords) location = await reverseGeocode(coords.lat, coords.lon);
  else if (zip) location = (await geocodeZip(zip)) ?? { zip, label: `ZIP ${zip}`, lat: null, lon: null };

  let stores: StoreInfo[] = [];
  if (location?.lat != null && location.lon != null) {
    const { lat, lon } = location;
    let elements = await queryOverpass(lat, lon, 4000);
    if (elements && toStores(elements, lat, lon).length < 3) {
      const wider = await queryOverpass(lat, lon, 12000);
      if (wider) elements = wider;
    }
    if (elements) stores = selectStores(toStores(elements, lat, lon));
  }

  let result: StoresResult;
  if (stores.length >= 2) {
    result = { location: location!, stores, source: "osm", note: null };
  } else {
    const reg = regionalStores(location?.zip ?? zip);
    const have = new Set(stores.map((s) => s.chain).filter(Boolean));
    result = {
      location: location ?? { zip: null, label: "the U.S.", lat: null, lon: null },
      stores: [...stores, ...reg.stores.filter((s) => !have.has(s.chain))].slice(0, 8),
      source: "regional",
      note: location
        ? `We couldn't map individual stores near ${location.label} right now, so we're using grocery chains common in ${reg.regionLabel}.`
        : `Add your ZIP code for stores near you — for now we're using chains common across ${reg.regionLabel}.`,
    };
  }
  cache.set(preKey, { at: Date.now(), ttl: result.source === "osm" ? 6 * 60 * 60 * 1000 : 5 * 60 * 1000, value: result });
  return result;
}
