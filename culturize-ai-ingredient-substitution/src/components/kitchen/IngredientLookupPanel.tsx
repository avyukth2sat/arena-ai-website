"use client";

import Link from "next/link";
import { useState } from "react";
import { card } from "@/components/ui";
import { KIND_META } from "@/lib/kb/stores";
import type { IngredientSearchResult, MissingIngredientResponse, RecipeIngredient, StoreRef } from "@/lib/types";

function IngredientPhoto({ src, alt }: { src: string | null; alt: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) {
    return (
      <div className="bg-dots grid min-h-48 place-items-center rounded-2xl bg-sand text-6xl" aria-label={`No photo available for ${alt}`}>
        🥬
      </div>
    );
  }
  return (
    // Encyclopedia thumbnails are real, source-attributed photos; fall back safely if unavailable.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)}
      className="max-h-72 min-h-48 w-full rounded-2xl bg-sand object-cover"
    />
  );
}

function MatchPill({ store }: { store: StoreRef | null }) {
  if (!store) return <span className="text-xs text-muted">Check your local international aisle</span>;
  const kind = KIND_META[store.kind];
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${kind.tone}`}>
      {kind.icon} {store.name}{store.distanceMi == null ? "" : ` · ${store.distanceMi} mi`}
    </span>
  );
}

function SubstituteOptions({ options }: { options: IngredientSearchResult["substitutes"] }) {
  if (options.length === 0) return null;
  return (
    <div className="mt-5">
      <h3 className="font-display text-xl font-semibold">Possible substitutes</h3>
      <ul className="mt-3 space-y-3">
        {options.map((s) => (
          <li key={s.name} className="rounded-2xl border border-clay/70 bg-sand/45 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="font-semibold">{s.name}</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold ring-1 ring-clay">{s.match}% flavor match</span>
            </div>
            <p className="mt-2 text-sm text-muted"><span className="font-semibold text-ink">How much:</span> {s.ratio}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.why}</p>
            <p className="mt-2 text-xs font-semibold text-herb">📍 {s.foundLabel}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function IngredientLookupPanel({ result }: { result: IngredientSearchResult }) {
  const google = `https://www.google.com/search?q=${encodeURIComponent(`${result.query} ingredient food`)}`;
  return (
    <article className={`${card} animate-rise overflow-hidden`}>
      <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div>
          <IngredientPhoto src={result.image} alt={result.name} />
          {result.image && result.articleUrl && (
            <p className="mt-1.5 text-[11px] text-muted">Photo via Wikimedia / Wikipedia</p>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-paprika">
            {result.kind === "library" ? "Culturize ingredient guide" : "Food & ingredient lookup"}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-tight">{result.name}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.category && <span className="rounded-full bg-sand px-3 py-1 text-xs font-medium">{result.category}</span>}
            {result.cuisines.map((c) => <span key={c} className="rounded-full bg-saffron-soft px-3 py-1 text-xs font-medium">{c}</span>)}
          </div>
          {result.description ? (
            <p className="mt-4 text-[15px] leading-relaxed text-muted">{result.description}</p>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              We don&apos;t have an encyclopedia entry for this spelling yet. Try another name or search the web for more context.
            </p>
          )}
          {result.where && (
            <p className="mt-4 rounded-2xl bg-herb-soft/55 p-3 text-sm text-herb">
              🧭 <span className="font-semibold">Where to look:</span> {result.where}
            </p>
          )}
          {result.articleUrl ? (
            <a href={result.articleUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-muted underline decoration-clay underline-offset-4 hover:text-paprika">
              Read the {result.articleTitle ?? "encyclopedia"} reference ↗
            </a>
          ) : (
            <a href={google} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm font-semibold text-muted underline decoration-clay underline-offset-4 hover:text-paprika">
              Search more about {result.query} ↗
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-clay/70 px-5 pb-5 sm:px-7 sm:pb-7">
        {result.substitutes.length > 0 ? (
          <SubstituteOptions options={result.substitutes} />
        ) : (
          <div className="mt-5 rounded-2xl bg-saffron-soft/60 p-4">
            <p className="font-semibold">Need a substitute for this ingredient?</p>
            <p className="mt-1 text-sm text-muted">Choose “I&apos;m missing an ingredient” and tell us the dish you&apos;re making.</p>
            <Link href="/kitchen?mode=missing" className="mt-3 inline-flex rounded-full bg-paprika px-4 py-2 text-sm font-semibold text-white hover:bg-paprika-dark">
              Find a dish-specific substitute →
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}

export function MissingSwapPanel({ result }: { result: Extract<MissingIngredientResponse, { ok: true }> }) {
  const item: RecipeIngredient = result.ingredient;
  const isSwap = item.status === "swap";
  const isReal = item.status === "authentic_nearby";
  return (
    <article className={`${card} animate-rise overflow-hidden`}>
      <div className="bg-ink px-5 py-5 text-cream sm:px-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-saffron">Ingredient rescue</p>
        <h2 className="mt-1 font-display text-3xl font-semibold">{result.dish}</h2>
        <p className="mt-1 text-sm text-cream/70">Looking for a replacement for <span className="font-semibold text-cream">{item.original}</span></p>
        <p className="mt-3 text-xs text-cream/60">📍 Matched for {result.location.label}</p>
      </div>

      <div className="space-y-5 p-5 sm:p-7">
        {isSwap ? (
          <div className="rounded-3xl border border-saffron/60 bg-saffron-soft/55 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-paprika">Best local match</p>
                <h3 className="mt-1 font-display text-2xl font-semibold">{item.use}</h3>
                {item.ratio && <p className="mt-2 text-sm"><span className="font-semibold">Use:</span> {item.ratio}</p>}
              </div>
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-clay">{item.match}% flavor match</span>
            </div>
            {item.why && <p className="mt-3 leading-relaxed text-muted">{item.why}</p>}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <MatchPill store={item.store} />
              {item.buy.map((b) => <span key={b.product} className="rounded-full bg-white px-2.5 py-1 text-xs text-muted ring-1 ring-clay">{b.aisle} · ~${b.price.toFixed(2)}</span>)}
            </div>
          </div>
        ) : isReal ? (
          <div className="rounded-3xl border border-herb/30 bg-herb-soft/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-herb">Good news — no substitute needed</p>
            <h3 className="mt-1 font-display text-2xl font-semibold">The authentic {item.original} is nearby</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.why}</p>
            <div className="mt-4"><MatchPill store={item.store} /></div>
          </div>
        ) : item.status === "specialty" ? (
          <div className="rounded-3xl border border-plum/30 bg-plum/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-plum">No tested substitute in the library yet</p>
            <h3 className="mt-1 font-display text-2xl font-semibold">Try the closest specialty aisle</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.why}</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-clay bg-sand/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-herb">Already easy to find</p>
            <h3 className="mt-1 font-display text-2xl font-semibold">Use {item.original} as written</h3>
            <p className="mt-2 text-sm text-muted">It&apos;s a common grocery item — no substitution needed.</p>
          </div>
        )}

        {item.alternatives.length > 0 && (
          <div>
            <h3 className="font-display text-xl font-semibold">Other options</h3>
            <ul className="mt-2 space-y-2">
              {item.alternatives.map((a) => (
                <li key={a.name} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-clay/70 bg-white p-3 text-sm">
                  <span className="font-semibold">{a.name}</span>
                  <span className="text-xs text-muted">{a.match}%{a.storeName ? ` · ${a.storeName}` : ""}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <details className="rounded-2xl border border-clay/70 bg-white p-4">
          <summary className="cursor-pointer font-semibold">What is {result.knowledge.name}?</summary>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            {result.knowledge.image && (
              <div className="sm:w-40">
                <IngredientPhoto src={result.knowledge.image} alt={result.knowledge.name} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-relaxed text-muted">{result.knowledge.description ?? "We don't have a description for this spelling yet."}</p>
              {result.knowledge.articleUrl && <a href={result.knowledge.articleUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-paprika underline">Read the {result.knowledge.articleTitle ?? "reference"} ↗</a>}
            </div>
          </div>
        </details>
      </div>
    </article>
  );
}
