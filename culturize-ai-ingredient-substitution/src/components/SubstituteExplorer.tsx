"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { flagForCuisine } from "@/lib/cuisines";
import { IngredientLookupPanel } from "@/components/kitchen/IngredientLookupPanel";
import type { IngredientSearchResult } from "@/lib/types";
import { input } from "./ui";

export interface ExplorerItem {
  id: string;
  name: string;
  short: string;
  aliases: string[];
  cuisines: string[];
  category: string;
  description?: string;
  where: string;
  regions: string[];
  substitutes: { name: string; match: number; ratio: string; why: string; foundLabel: string }[];
}

const REGIONS = [
  "All",
  "Africa",
  "Caribbean",
  "Latin America",
  "East Asia",
  "Southeast Asia",
  "South Asia",
  "Middle East & N. Africa",
  "Europe",
];

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ");

const PAGE = 24;

function ItemCard({ item }: { item: ExplorerItem }) {
  return (
    <article className="flex flex-col rounded-3xl border border-clay/70 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">{item.category}</p>
          <h3 className="mt-0.5 font-display text-xl font-semibold leading-snug">{item.name}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-sand px-2.5 py-1 text-sm" title={item.cuisines.join(", ")}>
          {[...new Set(item.cuisines.slice(0, 3).map((c) => flagForCuisine(c)))].join(" ")}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">{item.cuisines.slice(0, 4).join(" · ")}</p>
      {item.description && <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>}
      <p className="mt-3 rounded-xl bg-herb-soft/50 px-3 py-2 text-xs text-herb">
        🧭 <span className="font-semibold">The real thing:</span> {item.where}
      </p>
      <ul className="mt-4 flex-1 space-y-3">
        {item.substitutes.map((s, i) => (
          <li
            key={s.name}
            className={`rounded-2xl p-3 ${i === 0 ? "bg-saffron-soft/50 ring-1 ring-saffron/40" : "bg-sand/50"}`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-ink">{s.name}</p>
              <span className="shrink-0 text-xs font-semibold">{s.match}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-gradient-to-r from-saffron to-paprika"
                style={{ width: `${s.match}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted">
              <span className="font-semibold text-ink">How much:</span> {s.ratio}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{s.why}</p>
            <p className="mt-1.5 text-[11px] font-semibold text-herb">📍 {s.foundLabel}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function SubstituteExplorer({ items, initialQuery }: { items: ExplorerItem[]; initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState("All");
  const [limit, setLimit] = useState(PAGE);
  const [lookupRaw, setLookup] = useState<IngredientSearchResult | null>(null);

  const filtered = useMemo(() => {
    const q = norm(query).trim();
    return items.filter((item) => {
      if (region !== "All" && !item.regions.includes(region)) return false;
      if (!q) return true;
      const hay = norm(
        [item.name, item.short, ...item.aliases, ...item.cuisines, ...item.substitutes.map((s) => s.name)].join(" "),
      );
      return q.split(/\s+/).every((t) => hay.includes(t));
    });
  }, [items, query, region]);

  const noMatches = filtered.length === 0 && query.trim().length >= 2;
  const lookup = noMatches && lookupRaw?.query.toLowerCase() === query.trim().toLowerCase() ? lookupRaw : null;
  useEffect(() => {
    if (!noMatches) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/substitute?q=${encodeURIComponent(query.trim())}`, { signal: ctrl.signal });
        const data = (await res.json()) as { ok?: boolean; ingredient?: IngredientSearchResult };
        if (res.ok && data.ok && data.ingredient) setLookup(data.ingredient);
      } catch {
        /* aborted */
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [noMatches, query]);

  return (
    <section className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">
            🔎
          </span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search any ingredient — moong dal, moringa, shatkora, galangal…"
            className={`${input} pl-12`}
            aria-label="Search ingredients"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {REGIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRegion(r);
                setLimit(PAGE);
              }}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                region === r ? "bg-ink text-cream" : "border border-clay bg-white text-muted hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">
        Showing {Math.min(limit, filtered.length)} of {filtered.length} curated ingredients · search also checks wider food references
      </p>

      {filtered.length === 0 ? (
        noMatches ? (
          lookup ? (
            <div className="mt-6">
              <IngredientLookupPanel result={lookup} />
            </div>
          ) : (
            <div className="mt-6 animate-pulse rounded-3xl border border-clay bg-white p-8">
              <p className="font-display text-2xl font-semibold">Searching ingredient references…</p>
              <p className="mt-2 text-sm text-muted">Checking the Culturize library and food encyclopedia.</p>
            </div>
          )
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-clay bg-white p-10 text-center">
            <p className="text-4xl">🧺</p>
            <p className="mt-3 font-display text-2xl font-semibold">No ingredients in this region yet</p>
            <p className="mt-2 text-muted">Choose “All” or search any ingredient to check the broader food encyclopedia.</p>
          </div>
        )
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.slice(0, limit).map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
      {filtered.length > limit && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="rounded-full border border-clay bg-white px-6 py-2.5 text-sm font-semibold hover:bg-sand"
          >
            Show more ingredients
          </button>
        </div>
      )}
    </section>
  );
}
