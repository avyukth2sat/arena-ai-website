import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { CUISINE_FLAGS } from "@/lib/cuisines";
import { stemText } from "@/lib/kb/text";
import type { RawRecipe } from "@/lib/types";

const BROWSER_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const MEALDB = "https://www.themealdb.com/api/json/v1/1";

/* ------------------------------------------------------------------ */
/* Tiny TTL cache (TheMealDB allows ~60 requests / 10s per IP)          */
/* ------------------------------------------------------------------ */

type Entry = { at: number; ttl: number; value: unknown };
const g = globalThis as typeof globalThis & { __culturizeSrc?: Map<string, Entry>; __culturizeSrcFlight?: Map<string, Promise<unknown>> };
const store = g.__culturizeSrc ?? (g.__culturizeSrc = new Map());
const flight = g.__culturizeSrcFlight ?? (g.__culturizeSrcFlight = new Map());

async function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.value as T;
  const pending = flight.get(key);
  if (pending) return pending as Promise<T>;
  const task = fn()
    .then((value) => {
      const empty = value === null || (Array.isArray(value) && value.length === 0);
      store.set(key, { at: Date.now(), ttl: empty ? 2 * 60 * 1000 : ttlMs, value });
      if (store.size > 400) store.delete(store.keys().next().value as string);
      return value;
    })
    .finally(() => flight.delete(key));
  flight.set(key, task);
  return task;
}

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

const STOP = new Set(
  "recipe recipes how to make the a an with and of best easy simple homemade traditional authentic style classic my mom mothers grandmas".split(" "),
);
const DEMONYMS = new Set(
  [...Object.keys(CUISINE_FLAGS), "American", "British", "French", "Irish", "Spanish", "Dutch", "Swedish", "Canadian", "Croatian", "Tunisian", "Uruguayan", "Cypriot", "South", "North", "East", "West", "African", "Asian", "Caribbean", "Latin", "Middle", "Eastern"]
    .flatMap((k) => stemText(k).split(" "))
    .filter(Boolean),
);

export function queryTerms(q: string): { tokens: string[]; core: string[] } {
  const tokens = stemText(q).split(" ").filter((t) => t && !STOP.has(t));
  const core = tokens.filter((t) => !DEMONYMS.has(t));
  return { tokens, core: core.length ? core : tokens };
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", frac12: "½", frac14: "¼", frac34: "¾", deg: "°" };
function clean(text: string): string {
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z0-9]+);/gi, (m, n: string) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

function splitInstructionText(text: string): string[] {
  const cleaned = text.replace(/\r/g, "").replace(/\bstep\s*\d+\s*[:.\-–]?\s*/gi, "\n");
  let parts = cleaned
    .split(/\n+/)
    .map((p) => p.replace(/^\d+[.)]\s*/, "").trim())
    .filter((p) => p.length > 2);
  if (parts.length < 3) {
    const sentences = cleaned
      .replace(/\n+/g, " ")
      .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
      .map((p) => p.trim())
      .filter(Boolean);
    parts = [];
    for (let i = 0; i < sentences.length; i += 2) parts.push(sentences.slice(i, i + 2).join(" "));
  }
  return parts.slice(0, 30);
}

/* ------------------------------------------------------------------ */
/* TheMealDB                                                           */
/* ------------------------------------------------------------------ */

type MealRow = Record<string, string | null>;

async function mealdb(path: string): Promise<MealRow[] | null> {
  try {
    const res = await fetch(`${MEALDB}/${path}`, { signal: AbortSignal.timeout(6000), cache: "no-store", headers: { "User-Agent": "Culturize/1.0" } });
    const text = await res.text();
    const json = JSON.parse(text) as { meals: MealRow[] | null };
    return json.meals ?? [];
  } catch {
    return null; // timeout, rate limit page, or bad JSON
  }
}

function scoreMeal(tokens: string[], row: MealRow): number {
  const name = stemText(row.strMeal ?? "").split(" ").filter(Boolean);
  const extra = stemText(`${row.strArea ?? ""} ${row.strCountry ?? ""} ${row.strCategory ?? ""}`).split(" ");
  const pool = new Set([...name, ...extra]);
  if (tokens.length === 0 || name.length === 0) return 0;
  const qcov = tokens.filter((t) => pool.has(t)).length / tokens.length;
  const ncov = name.filter((t) => tokens.includes(t)).length / name.length;
  return qcov >= 1 && ncov >= 0.7 ? qcov + ncov : 0;
}

export async function searchMealRows(query: string): Promise<MealRow[]> {
  const { tokens, core } = queryTerms(query);
  if (core.length === 0) return [];
  const longest = [...core].sort((a, b) => b.length - a.length)[0];
  const attempts = [...new Set([tokens.join(" "), core.join(" "), core.slice(-2).join(" "), core.length > 1 ? longest : ""].filter(Boolean))].slice(0, 3);
  const all: MealRow[] = [];
  for (const term of attempts) {
    const rows = await cached(`meal:${term}`, 6 * 3600 * 1000, () => mealdb(`search.php?s=${encodeURIComponent(term)}`));
    if (rows?.length) all.push(...rows);
    if (all.some((r) => scoreMeal(tokens, r) > 0)) break;
  }
  const seen = new Set<string>();
  return all.filter((r) => r.idMeal && !seen.has(r.idMeal) && seen.add(r.idMeal));
}

function mealToRaw(row: MealRow): RawRecipe {
  const ingredients: RawRecipe["ingredients"] = [];
  for (let i = 1; i <= 20; i++) {
    const name = (row[`strIngredient${i}`] ?? "").trim();
    if (!name) continue;
    ingredients.push({ qty: (row[`strMeasure${i}`] ?? "").trim(), name });
  }
  const area = row.strArea?.trim() || row.strCountry?.trim() || null;
  return {
    name: (row.strMeal ?? "Recipe").trim(),
    cuisine: area,
    country: row.strCountry?.trim() || null,
    description: [row.strCategory, area ? `${area} cuisine` : null].filter(Boolean).join(" · ") || null,
    image: row.strMealThumb ?? null,
    servings: null,
    prepMinutes: null,
    cookMinutes: null,
    ingredients,
    steps: splitInstructionText(row.strInstructions ?? ""),
    source: { kind: "themealdb", name: "TheMealDB", url: row.strSource?.trim() || `https://www.themealdb.com/meal/${row.idMeal}` },
  };
}

export async function findMealDbRecipe(query: string): Promise<RawRecipe | null> {
  const { tokens } = queryTerms(query);
  const rows = await searchMealRows(query);
  const best = rows
    .map((r) => ({ r, score: scoreMeal(tokens, r) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)[0];
  if (!best) return null;
  const raw = mealToRaw(best.r);
  return raw.ingredients.length >= 2 && raw.steps.length >= 1 ? raw : null;
}

/** Fast type-ahead names from TheMealDB. */
export async function suggestMealNames(query: string): Promise<{ name: string; area: string | null; image: string | null }[]> {
  const rows = await searchMealRows(query).catch(() => []);
  return rows.slice(0, 6).map((r) => ({ name: (r.strMeal ?? "").trim(), area: r.strArea ?? r.strCountry ?? null, image: r.strMealThumb ?? null }));
}

/* ------------------------------------------------------------------ */
/* Wikimedia encyclopedia lookup for ingredients without a local entry  */
/* ------------------------------------------------------------------ */

const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
export interface WikipediaSearchHit {
  title: string;
  snippet: string;
  url: string;
}

function coverage(query: string, text: string): number {
  const terms = stemText(query).split(" ").filter((x) => x.length > 1);
  if (terms.length === 0) return 0;
  const hay = new Set(stemText(text).split(" "));
  return terms.filter((x) => hay.has(x)).length / terms.length;
}

export async function searchWikipediaPages(query: string, limit = 5): Promise<WikipediaSearchHit[]> {
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];
  return cached(`wiki-search:${stemText(q)}`, 12 * 60 * 60 * 1000, async () => {
    try {
      const params = new URLSearchParams({
        action: "query",
        list: "search",
        srsearch: q,
        srlimit: String(Math.min(8, Math.max(1, limit))),
        srprop: "snippet",
        format: "json",
        utf8: "1",
      });
      const res = await fetch(`${WIKIPEDIA_API}?${params}`, {
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
        headers: { "User-Agent": "Culturize/1.0 (cultural ingredient lookup)" },
      });
      if (!res.ok) return [];
      const data = (await res.json()) as {
        query?: { search?: { title: string; snippet: string }[] };
      };
      return (data.query?.search ?? []).map((hit) => ({
        title: clean(hit.title),
        snippet: clean(hit.snippet),
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, "_"))}`,
      }));
    } catch {
      return [];
    }
  });
}

export async function findWikipediaFoodPages(query: string, limit = 3): Promise<WikipediaSearchHit[]> {
  const hits = await searchWikipediaPages(query, 8);
  return hits
    .map((hit) => ({ hit, score: coverage(query, `${hit.title} ${hit.snippet}`) + coverage(query, hit.title) * 0.7 }))
    .filter(({ hit, score }) => score >= 0.75 && !/\b(disambiguation|season|episode|film|album|song|football|politician|company)\b/i.test(hit.title))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ hit }) => hit);
}

export async function lookupWikipediaEntry(query: string, preferredTitle?: string): Promise<import("@/lib/types").EncyclopediaEntry | null> {
  const cacheKey = `wiki-entry:${stemText(preferredTitle || query)}`;
  return cached(cacheKey, 24 * 60 * 60 * 1000, async () => {
    try {
      let title = preferredTitle?.trim();
      if (!title) {
        const hits = await searchWikipediaPages(query, 8);
        const ranked = hits
          .map((hit) => ({ hit, score: coverage(query, `${hit.title} ${hit.snippet}`) + coverage(query, hit.title) * 0.7 }))
          .filter(({ hit, score }) => score >= 0.75 && !/\b(disambiguation|season|episode|film|album|song|football|politician|company)\b/i.test(hit.title))
          .sort((a, b) => b.score - a.score);
        title = ranked[0]?.hit.title;
      }
      if (!title) return null;
      const params = new URLSearchParams({
        action: "query",
        prop: "extracts|pageimages",
        exintro: "1",
        explaintext: "1",
        pithumbsize: "720",
        redirects: "1",
        titles: title,
        format: "json",
        formatversion: "2",
      });
      const res = await fetch(`${WIKIPEDIA_API}?${params}`, {
        signal: AbortSignal.timeout(5000),
        cache: "no-store",
        headers: { "User-Agent": "Culturize/1.0 (cultural ingredient lookup)" },
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        query?: { pages?: { title?: string; extract?: string; thumbnail?: { source?: string } }[] };
      };
      const page = data.query?.pages?.[0];
      const extract = page?.extract?.replace(/\\s+/g, " ").trim();
      if (!page?.title || !extract) return null;
      const summary = extract.length > 850 ? `${extract.slice(0, 847).trimEnd()}…` : extract;
      return {
        title: page.title,
        extract: summary,
        image: page.thumbnail?.source ?? null,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
      };
    } catch {
      return null;
    }
  });
}

/* ------------------------------------------------------------------ */
/* Safe HTTP fetch for arbitrary web pages                             */
/* ------------------------------------------------------------------ */

function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 6) {
    const l = ip.toLowerCase();
    return l === "::1" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80") || l.startsWith("::ffff:127.") || l.startsWith("::ffff:10.") || l.startsWith("::ffff:192.168.");
  }
  const [a, b2] = ip.split(".").map(Number);
  return a === 10 || a === 127 || a === 0 || (a === 169 && b2 === 254) || (a === 172 && b2 >= 16 && b2 <= 31) || (a === 192 && b2 === 168) || (a === 100 && b2 >= 64 && b2 <= 127);
}

async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw);
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http(s) links are supported.");
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("That address isn't public.");
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new Error("That address isn't public.");
  } else {
    const records = await lookup(host, { all: true });
    if (records.length === 0 || records.some((r) => isPrivateIp(r.address))) throw new Error("That address isn't public.");
  }
  return url;
}

async function fetchHtml(rawUrl: string, timeoutMs = 7000): Promise<{ html: string; url: string }> {
  let current = rawUrl;
  for (let hop = 0; hop < 4; hop++) {
    const url = await assertPublicUrl(current);
    const res = await fetch(url, {
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": BROWSER_UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      current = new URL(res.headers.get("location")!, url).toString();
      continue;
    }
    if (!res.ok) throw new Error(`The site returned ${res.status}.`);
    const type = res.headers.get("content-type") ?? "";
    if (!/html|xml/i.test(type)) throw new Error("That link isn't a web page.");
    const html = (await res.text()).slice(0, 2_500_000);
    return { html, url: url.toString() };
  }
  throw new Error("Too many redirects.");
}

/* ------------------------------------------------------------------ */
/* schema.org Recipe parsing                                           */
/* ------------------------------------------------------------------ */

function isoMinutes(v: unknown): number | null {
  if (typeof v !== "string") return null;
  const m = v.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!m) return null;
  const mins = (+(m[1] ?? 0)) * 1440 + (+(m[2] ?? 0)) * 60 + +(m[3] ?? 0);
  return mins > 0 ? mins : null;
}

function firstString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) for (const x of v) { const r = firstString(x); if (r) return r; }
  if (v && typeof v === "object") return firstString((v as Record<string, unknown>).url ?? (v as Record<string, unknown>).name);
  return null;
}

function flattenSteps(x: unknown): string[] {
  if (!x) return [];
  if (typeof x === "string") return splitInstructionText(clean(x.replace(/<\/(p|li|div)>|<br\s*\/?>/gi, "\n")));
  if (Array.isArray(x)) return x.flatMap(flattenSteps);
  if (typeof x === "object") {
    const o = x as Record<string, unknown>;
    if (o.itemListElement) return flattenSteps(o.itemListElement);
    const t = o.text ?? o.name;
    return typeof t === "string" && clean(t) ? [clean(t)] : [];
  }
  return [];
}

function findRecipeNode(node: unknown): Record<string, unknown> | null {
  if (!node || typeof node !== "object") return null;
  if (Array.isArray(node)) {
    for (const n of node) { const r = findRecipeNode(n); if (r) return r; }
    return null;
  }
  const o = node as Record<string, unknown>;
  const types = ([] as unknown[]).concat(o["@type"] ?? []).map(String);
  if (types.includes("Recipe")) return o;
  return findRecipeNode(o["@graph"]) ?? findRecipeNode(o.mainEntity) ?? findRecipeNode(o.itemListElement);
}

export function parseRecipeHtml(html: string, pageUrl: string): RawRecipe | null {
  const blocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  for (const block of blocks) {
    let json: unknown;
    try { json = JSON.parse(block.trim()); } catch { continue; }
    const node = findRecipeNode(json);
    if (!node) continue;
    const ingredients = ([] as unknown[])
      .concat(node.recipeIngredient ?? [])
      .filter((x): x is string => typeof x === "string")
      .map((x) => clean(x))
      .filter(Boolean)
      .slice(0, 50)
      .map((line) => ({ qty: null, name: line }));
    const steps = flattenSteps(node.recipeInstructions).slice(0, 40);
    const name = typeof node.name === "string" ? clean(node.name) : "";
    if (!name || ingredients.length < 2 || steps.length < 1) continue;
    const yieldNum = firstString(node.recipeYield)?.match(/\d+/)?.[0];
    const image = firstString(node.image);
    const cuisine = firstString(node.recipeCuisine);
    const host = new URL(pageUrl).hostname.replace(/^www\./, "");
    const desc = typeof node.description === "string" ? clean(node.description) : "";
    return {
      name,
      cuisine: cuisine ? clean(cuisine) : null,
      country: null,
      description: desc ? (desc.length > 220 ? `${desc.slice(0, 217).trimEnd()}…` : desc) : null,
      image: image && /^https?:\/\//.test(image) ? image : null,
      servings: yieldNum ? Math.min(24, Math.max(1, parseInt(yieldNum, 10))) : null,
      prepMinutes: isoMinutes(node.prepTime),
      cookMinutes: isoMinutes(node.cookTime) ?? isoMinutes(node.totalTime),
      ingredients,
      steps,
      source: { kind: "web", name: host, url: pageUrl },
    };
  }
  return null;
}

/** Import a recipe from any public recipe page that publishes schema.org data. */
export async function importRecipeFromUrl(rawUrl: string): Promise<RawRecipe> {
  const { html, url } = await fetchHtml(rawUrl, 9000);
  const recipe = parseRecipeHtml(html, url);
  if (!recipe) throw new Error("We couldn't find a recipe on that page. Try pasting the ingredients instead.");
  return recipe;
}

/* ------------------------------------------------------------------ */
/* Web search (Bing HTML) → recipe pages                                */
/* ------------------------------------------------------------------ */

const SKIP_HOSTS = /(^|\.)(wikipedia|youtube|facebook|pinterest|instagram|tiktok|reddit|amazon|twitter|x|linkedin|quora|britannica|bing|microsoft|yelp|tripadvisor)\.[a-z.]+$/i;

async function bingResults(query: string): Promise<string[]> {
  try {
    const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}&format=rss&count=12&mkt=en-US`, {
      signal: AbortSignal.timeout(7000),
      cache: "no-store",
      headers: { "User-Agent": BROWSER_UA, "Accept-Language": "en-US,en;q=0.9" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const seen = new Set<string>();
    const urls: string[] = [];
    for (const m of xml.matchAll(/<item>[\s\S]*?<link>([^<]+)<\/link>/g)) {
      const u = clean(m[1]);
      try {
        const host = new URL(u).hostname;
        if (!/^https?:/.test(u) || SKIP_HOSTS.test(host) || seen.has(host)) continue;
        seen.add(host);
        urls.push(u);
      } catch { /* skip malformed */ }
    }
    return urls;
  } catch {
    return [];
  }
}

function relevance(query: string, recipe: RawRecipe): number {
  const { core } = queryTerms(query);
  if (core.length === 0) return 0;
  const pool = new Set(stemText(`${recipe.name} ${recipe.cuisine ?? ""}`).split(" "));
  return core.filter((t) => pool.has(t)).length / core.length;
}

export async function findWebRecipe(query: string, cuisine?: string): Promise<RawRecipe | null> {
  return cached(`web:${stemText(query)}|${cuisine ?? ""}`, 3 * 3600 * 1000, async () => {
    const { core } = queryTerms(query);
    const phrasings = [
      `${query} ${cuisine ?? ""} recipe`,
      `"${core.join(" ")}" recipe${cuisine ? ` ${cuisine}` : ""}`,
      `how to cook ${query} step by step ingredients`,
    ].map((q) => q.replace(/\s+/g, " ").trim());

    for (const phrasing of [...new Set(phrasings)]) {
      const urls = await bingResults(phrasing);
      const pages = await Promise.all(
        urls.slice(0, 6).map(async (u) => {
          try {
            const { html, url } = await fetchHtml(u, 6500);
            return parseRecipeHtml(html, url);
          } catch {
            return null;
          }
        }),
      );
      const best = pages
        .map((r, i) => ({ r, i, rel: r ? relevance(query, r) : 0 }))
        .filter((x): x is { r: RawRecipe; i: number; rel: number } => x.r !== null && x.rel >= 0.6)
        .sort((x, y) => y.rel - x.rel || x.i - y.i)[0];
      if (best) return best.r;
    }
    return null;
  });
}

export function looksLikeUrl(text: string): boolean {
  return /^https?:\/\/\S+$/i.test(text.trim());
}

/* ------------------------------------------------------------------ */
/* Wikibooks Cookbook (CC BY-SA) — thousands of cultural recipes        */
/* ------------------------------------------------------------------ */

const WIKIBOOKS_API = "https://en.wikibooks.org/w/api.php";
const WB_SKIP = /cuisine of|ingredients|equipment|techniques|recipes?$|category|index|glossary|substitut|measurement|\bseed$/i;

async function wikibooksSearch(term: string): Promise<string[]> {
  try {
    const url = `${WIKIBOOKS_API}?action=query&list=search&srsearch=${encodeURIComponent(term)}&srnamespace=102&srlimit=8&format=json&formatversion=2`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000), cache: "no-store", headers: { "User-Agent": "Culturize/1.0 (recipe lookup)" } });
    if (!res.ok) return [];
    const json = (await res.json()) as { query?: { search?: { title: string }[] } };
    return (json.query?.search ?? []).map((x) => x.title).filter((t) => !WB_SKIP.test(t));
  } catch {
    return [];
  }
}

export async function suggestWikibooksRecipes(query: string, limit = 5): Promise<string[]> {
  const { tokens, core } = queryTerms(query);
  if (core.length === 0) return [];
  const terms = [...new Set([query.trim(), core.join(" ")])];
  const titles = [...new Set((await Promise.all(terms.map(wikibooksSearch))).flat())];
  return titles
    .map((title) => {
      const words = stemText(title.replace(/^Cookbook:/, "")).split(" ");
      const hits = core.filter((term) => words.includes(term)).length;
      const score = hits / core.length;
      return { title: title.replace(/^Cookbook:/, ""), score, extra: words.length - hits };
    })
    .filter((x) => x.score >= 0.5)
    .sort((a, b) => b.score - a.score || a.extra - b.extra)
    .slice(0, limit)
    .map((x) => x.title);
}

function rowCells(row: string): string[] {
  return [...row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((m) => clean(m[1]));
}
const isDash = (s: string) => !s || /^[–—-]+$/.test(s);

function wikibooksIngredients(section: string): RawRecipe["ingredients"] {
  const out: RawRecipe["ingredients"] = [];
  if (/<table/i.test(section)) {
    for (const row of section.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
      if (/<th/i.test(row[1])) continue;
      const cells = rowCells(row[1]);
      if (cells.length < 2 || !cells[0] || /^ingredient/i.test(cells[0])) continue;
      const [name, count = "", volume = "", weight = ""] = cells;
      const qty = [count, volume].filter((c) => !isDash(c)).join(" ") || (isDash(weight) ? "" : weight);
      out.push({ qty, name });
    }
  } else {
    for (const li of section.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
      const line = clean(li[1]);
      if (line.length > 1 && !line.endsWith(":")) out.push({ qty: null, name: line });
    }
  }
  return out.slice(0, 50);
}

function wikibooksSteps(section: string): string[] {
  const lis = [...section.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => clean(m[1])).filter((t) => t.length > 3);
  if (lis.length > 0) return lis.slice(0, 40);
  const paras = [...section.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => clean(m[1])).filter((t) => t.length > 3);
  return splitInstructionText(paras.join("\n")).slice(0, 40);
}

function minutesFromText(text: string | undefined): number | null {
  if (!text) return null;
  const h = text.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i);
  const m = text.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/i);
  const total = (h ? parseFloat(h[1]) * 60 : 0) + (m ? parseInt(m[1], 10) : 0);
  return total > 0 ? Math.round(total) : null;
}

async function wikibooksRecipe(title: string): Promise<RawRecipe | null> {
  try {
    const url = `${WIKIBOOKS_API}?action=parse&page=${encodeURIComponent(title)}&prop=text%7Cwikitext&redirects=1&format=json&formatversion=2`;
    const res = await fetch(url, { signal: AbortSignal.timeout(7000), cache: "no-store", headers: { "User-Agent": "Culturize/1.0 (recipe lookup)" } });
    if (!res.ok) return null;
    const json = (await res.json()) as { parse?: { title: string; text: string; wikitext: string } };
    const page = json.parse;
    if (!page) return null;

    const sections = page.text.split(/<h2\b/i).slice(1).map((seg) => {
      const end = seg.indexOf("</h2>");
      return { heading: clean(seg.slice(0, end < 0 ? 0 : end).replace(/^[^>]*>/, "")), body: seg.slice(end < 0 ? 0 : end + 5) };
    });
    const ingSec = sections.find((s) => /ingredient/i.test(s.heading));
    const stepSec = sections.find((s) => /procedure|instruction|direction|method|preparation|steps|how to/i.test(s.heading));
    if (!ingSec || !stepSec) return null;
    const ingredients = wikibooksIngredients(ingSec.body);
    const steps = wikibooksSteps(stepSec.body);
    if (ingredients.length < 3 || steps.length < 1) return null;

    const wt = page.wikitext;
    const field = (re: RegExp) => wt.match(re)?.[1]?.trim();
    const baseTitle = page.title.replace(/^Cookbook:/, "");
    const paren = baseTitle.match(/\(([^)]+)\)\s*$/)?.[1];
    const name = baseTitle.replace(/\s*\([^)]*\)\s*$/, "").trim();
    const titleWords = stemText(baseTitle).split(" ");
    const demonym = Object.keys(CUISINE_FLAGS).find((k) => titleWords.includes(stemText(k)));
    const region = field(/\|\s*(?:region|Origin|Cuisine)\s*=\s*([^\n|{}[\]]+)/i);
    const servings = field(/\|\s*servings\s*=\s*(\d+)/i);
    const imageName = field(/\|\s*image\s*=\s*(?:\[\[)?(?:File:|Image:)?([^\n|\]]+\.(?:jpe?g|png|webp))/i);
    const intro = [...page.text.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => clean(m[1])).find((t) => t.length > 70);
    const description = paren ? `${paren}` : intro ? (intro.length > 220 ? `${intro.slice(0, 217).trimEnd()}…` : intro) : null;

    return {
      name,
      cuisine: demonym ?? region ?? null,
      country: null,
      description,
      image: imageName ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(imageName.replace(/ /g, "_"))}?width=900` : null,
      servings: servings ? Math.min(24, Math.max(1, parseInt(servings, 10))) : null,
      prepMinutes: null,
      cookMinutes: minutesFromText(field(/\|\s*time\s*=\s*([^\n|]+)/i)),
      ingredients,
      steps,
      source: { kind: "web", name: "Wikibooks Cookbook (CC BY-SA)", url: `https://en.wikibooks.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_")).replace(/%3A/g, ":")}` },
    };
  } catch {
    return null;
  }
}

export async function findWikibooksRecipe(query: string): Promise<RawRecipe | null> {
  return cached(`wb:${stemText(query)}`, 6 * 3600 * 1000, async () => {
    const { tokens, core } = queryTerms(query);
    if (core.length === 0) return null;
    const terms = [...new Set([query.trim(), core.join(" ")])];
    const titles = [...new Set((await Promise.all(terms.map(wikibooksSearch))).flat())];
    const ranked = titles
      .map((t) => {
        const tt = stemText(t.replace(/^Cookbook:/, "")).split(" ");
        const coreCov = core.filter((c) => tt.includes(c)).length / core.length;
        const allCov = tokens.filter((c) => tt.includes(c)).length / Math.max(1, tokens.length);
        const extra = tt.filter((w) => !tokens.includes(w)).length;
        return { t, score: coreCov >= 1 ? coreCov + allCov - 0.05 * extra : 0 };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    const pages = await Promise.all(ranked.map((r) => wikibooksRecipe(r.t)));
    return pages.find((p): p is RawRecipe => p !== null) ?? null;
  });
}

/** Wikibooks and the open web in parallel: take the web result when it arrives promptly, else Wikibooks. */
export async function findOpenRecipe(query: string, cuisine?: string): Promise<RawRecipe | null> {
  const web = findWebRecipe(query, cuisine).catch(() => null);
  const wiki = await findWikibooksRecipe(query).catch(() => null);
  if (!wiki) return web;
  const quick = await Promise.race([web, new Promise<null>((r) => setTimeout(() => r(null), 3500))]);
  return quick ?? wiki;
}
