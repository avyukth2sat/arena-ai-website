"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { regionGradient } from "@/components/DishCard";
import { card } from "@/components/ui";
import { KIND_META } from "@/lib/kb/stores";
import type { CulturizedRecipe, IngredientStatus, RecipeIngredient, StoreRef } from "@/lib/types";

const STATUS_META: Record<IngredientStatus, { label: string; dot: string; chip: string; row: string }> = {
  authentic_nearby: {
    label: "Authentic · nearby",
    dot: "bg-herb",
    chip: "bg-herb-soft text-herb",
    row: "border-herb/30 bg-herb-soft/25",
  },
  swap: {
    label: "Smart swap",
    dot: "bg-saffron",
    chip: "bg-saffron-soft text-[#8a5a12]",
    row: "border-saffron/50 bg-saffron-soft/30",
  },
  easy: { label: "Easy find", dot: "bg-stone-300", chip: "bg-sand text-muted", row: "border-clay/70 bg-white" },
  pantry: { label: "Pantry", dot: "bg-stone-200", chip: "bg-stone-100 text-muted", row: "border-clay/50 bg-white" },
  specialty: {
    label: "Needs a look",
    dot: "bg-plum",
    chip: "bg-plum/10 text-plum",
    row: "border-plum/30 bg-plum/5",
  },
};

function sourceBadge(recipe: CulturizedRecipe): string {
  if (recipe.engine === "openai") return "✨ AI-generated";
  switch (recipe.source?.kind) {
    case "themealdb":
      return "📖 TheMealDB recipe";
    case "web":
      return "🌐 Found on the web";
    case "paste":
      return "📜 Your family recipe";
    default:
      return "🌶️ Culturize kitchen library";
  }
}

export function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export function StoreChip({ store, muted = false }: { store: StoreRef | null; muted?: boolean }) {
  if (!store) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-muted ring-1 ring-clay">
        🛒 Any supermarket
      </span>
    );
  }
  const meta = KIND_META[store.kind];
  return (
    <span
      title={meta.label}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${meta.tone} ${muted ? "opacity-60" : ""}`}
    >
      <span aria-hidden="true">{meta.icon}</span>
      {store.name}
      {store.distanceMi != null && <span className="opacity-70">· {store.distanceMi} mi</span>}
    </span>
  );
}

function MatchRing({ value }: { value: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const color = value >= 90 ? "#2F6A4D" : value >= 75 ? "#EFA23A" : "#C4462A";
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`${value}% flavor match`}>
      <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90">
        <circle cx="46" cy="46" r={r} stroke="#F3EADC" strokeWidth="9" fill="none" />
        <circle
          cx="46"
          cy="46"
          r={r}
          stroke={color}
          strokeWidth="9"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-2xl font-semibold leading-none">{value}%</p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">flavor match</p>
        </div>
      </div>
    </div>
  );
}

function MatchBar({ value }: { value: number }) {
  return (
    <div className="mt-2 flex items-center justify-end gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white ring-1 ring-clay">
        <div className="h-full rounded-full bg-gradient-to-r from-saffron to-paprika" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-semibold text-ink">{value}%</span>
    </div>
  );
}

function IngredientRow({ ing }: { ing: RecipeIngredient }) {
  const meta = STATUS_META[ing.status];
  const isSwap = ing.status === "swap";
  const isSpecialty = ing.status === "specialty";
  const price = ing.buy.reduce((n, b) => n + b.price, 0);
  const hasDetails = Boolean(
    ing.why || ing.ratio || ing.alternatives.length > 0 || ing.buy.length > 1 || (isSwap && ing.authenticWhere) || isSpecialty,
  );

  return (
    <li className={`rounded-2xl border p-4 ${meta.row}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="font-semibold text-ink">{isSwap ? ing.use : ing.original}</p>
            <p className="text-sm text-muted">{ing.quantity}</p>
          </div>
          {isSwap && (
            <p className="text-sm text-muted">
              instead of <span className="line-through decoration-paprika/60">{ing.original}</span>
            </p>
          )}
          {ing.status === "authentic_nearby" && <p className="text-sm text-herb">The real thing — no swap needed</p>}
          {isSpecialty && <p className="text-sm text-plum">Specialty item — no tested swap yet</p>}
          {ing.status !== "pantry" && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StoreChip store={ing.store} />
              {ing.buy[0] && (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs text-muted ring-1 ring-clay">
                  Aisle: {ing.buy[0].aisle}
                </span>
              )}
              {price > 0 && (
                <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-ink ring-1 ring-clay">
                  ~${price.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0 text-right">
          <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${meta.chip}`}>{meta.label}</span>
          {isSwap && <MatchBar value={ing.match} />}
        </div>
      </div>
      {hasDetails && (
        <details className="group mt-3 rounded-xl bg-white/80 px-3 py-2 text-sm ring-1 ring-clay/60">
          <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
            {isSwap ? "Why this swap works" : isSpecialty ? "Where to look" : "Details & backups"}
            <span className="text-muted transition group-open:rotate-180" aria-hidden="true">⌄</span>
          </summary>
          <div className="mt-2 space-y-2 leading-relaxed text-muted">
            {ing.why && <p>{ing.why}</p>}
            {ing.ratio && (
              <p>
                <span className="font-semibold text-ink">How much:</span> {ing.ratio}
              </p>
            )}
            {ing.buy.length > 1 && (
              <p>
                <span className="font-semibold text-ink">You&apos;ll buy:</span> {ing.buy.map((b) => b.product).join(" + ")}
              </p>
            )}
            {ing.alternatives.length > 0 && (
              <p>
                <span className="font-semibold text-ink">{isSwap ? "Other options:" : "If it's sold out:"}</span>{" "}
                {ing.alternatives
                  .map((a) => `${a.name} (${a.match}% match${a.storeName ? ` · ${a.storeName}` : ""})`)
                  .join("; ")}
              </p>
            )}
            {isSpecialty && (
              <p>
                💬 Need another option?{" "}
                <a href="/kitchen?mode=ingredient" className="font-semibold text-paprika hover:underline">
                  Search another ingredient →
                </a>
              </p>
            )}
            {isSwap && ing.authenticWhere && (
              <p>
                🧭 <span className="font-semibold text-ink">Want the real thing?</span> Look in {ing.authenticWhere}.
              </p>
            )}
          </div>
        </details>
      )}
    </li>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlighted({ text, phrases }: { text: string; phrases: string[] }) {
  const list = phrases.filter((p) => p.length > 2).sort((a, b) => b.length - a.length);
  if (list.length === 0) return <>{text}</>;
  const re = new RegExp(`(${list.map(escapeRegExp).join("|")})`, "gi");
  const lower = list.map((p) => p.toLowerCase());
  return (
    <>
      {text.split(re).map((part, i) =>
        lower.includes(part.toLowerCase()) ? (
          <mark key={i} className="rounded-md bg-saffron-soft px-1 py-0.5 font-medium text-ink">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function ShoppingList({ recipe }: { recipe: CulturizedRecipe }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const pantry = recipe.ingredients.filter((i) => i.status === "pantry");
  const done = Object.values(checked).filter(Boolean).length;
  const totalItems = recipe.shopping.reduce((n, g) => n + g.items.length, 0);

  async function copy() {
    const lines = [`Culturize shopping list — ${recipe.dishName} (serves ${recipe.servings})`, ""];
    for (const g of recipe.shopping) {
      lines.push(`${g.store?.name ?? "Any supermarket"}${g.store?.distanceMi != null ? ` (${g.store.distanceMi} mi)` : ""}`);
      for (const i of g.items) lines.push(`[ ] ${i.product} — ${i.aisle} — ~$${i.price.toFixed(2)}`);
      lines.push("");
    }
    lines.push(`Estimated total: ~$${recipe.shoppingTotal.toFixed(2)}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`${card} p-5 sm:p-6`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-semibold">Shopping list</h3>
          <p className="text-sm text-muted">
            {done}/{totalItems} in the cart · est. <span className="font-semibold text-ink">${recipe.shoppingTotal.toFixed(2)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="no-print rounded-full border border-clay px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-sand"
        >
          {copied ? "Copied ✓" : "Copy list"}
        </button>
      </div>
      <div className="mt-4 space-y-5">
        {recipe.shopping.map((g, gi) => (
          <div key={g.store?.id ?? `any-${gi}`}>
            <div className="flex items-center justify-between gap-2">
              <StoreChip store={g.store} />
              <span className="text-xs font-medium text-muted">${g.subtotal.toFixed(2)}</span>
            </div>
            <ul className="mt-2 divide-y divide-clay/50">
              {g.items.map((item, ii) => {
                const key = `${gi}-${ii}`;
                return (
                  <li key={key}>
                    <label className="flex cursor-pointer items-start gap-3 py-2">
                      <input
                        type="checkbox"
                        checked={Boolean(checked[key])}
                        onChange={() => setChecked((c) => ({ ...c, [key]: !c[key] }))}
                        className="mt-1 h-4 w-4 shrink-0 accent-paprika"
                      />
                      <span className={`flex-1 text-sm ${checked[key] ? "text-muted line-through" : "text-ink"}`}>
                        {item.product}
                        <span className="block text-xs text-muted">
                          {item.aisle} · for {item.forIngredient}
                        </span>
                      </span>
                      <span className="text-sm text-muted">${item.price.toFixed(2)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {pantry.length > 0 && (
        <p className="mt-5 rounded-xl bg-sand/70 px-3 py-2 text-xs text-muted">
          <span className="font-semibold text-ink">From your pantry:</span> {pantry.map((p) => p.original).join(", ")}
        </p>
      )}
    </div>
  );
}

type Filter = "all" | "swap" | "authentic_nearby" | "specialty";

export default function RecipeView({ recipe, actions }: { recipe: CulturizedRecipe; actions?: ReactNode }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const showPhoto = Boolean(recipe.image && failedImage !== recipe.image);
  const filterOptions: [Filter, string][] = [
    ["all", "All"],
    ["swap", `Swaps (${recipe.swapCount})`],
    ["authentic_nearby", `Authentic (${recipe.authenticFoundCount})`],
    ...(recipe.unverifiedCount ? ([["specialty", `Needs a look (${recipe.unverifiedCount})`]] as [Filter, string][]) : []),
  ];
  const shown = recipe.ingredients.filter((i) => filter === "all" || i.status === filter);
  const usedIds = new Set(recipe.shopping.map((g) => g.store?.id).filter(Boolean));
  const otherStores = recipe.stores.filter((s) => !usedIds.has(s.id));
  const totalMin = recipe.prepMinutes + recipe.cookMinutes;

  const stats: { label: string; value: string | number }[] = [
    { label: "Smart swaps", value: recipe.swapCount },
    { label: "Authentic finds", value: recipe.authenticFoundCount },
    ...(recipe.unverifiedCount ? [{ label: "Needs a look", value: recipe.unverifiedCount }] : []),
    { label: "Est. groceries", value: `$${Math.round(recipe.shoppingTotal)}` },
    { label: "Serves", value: recipe.servings },
    { label: "Time", value: totalMin ? formatMinutes(totalMin) : "—" },
    { label: "Level", value: recipe.difficulty },
  ];

  return (
    <article className="animate-rise space-y-6">
      <div className={`${card} overflow-hidden`}>
        <div className="grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="relative min-h-56">
            {showPhoto && recipe.image?.startsWith("/") ? (
              <Image
                src={recipe.image}
                alt={recipe.dishName}
                fill
                sizes="(min-width: 768px) 35vw, 100vw"
                className="object-cover"
                onError={() => setFailedImage(recipe.image)}
              />
            ) : showPhoto && recipe.image ? (
              // Imported recipe photos stay linked to their original source; invalid embeds fall back to cuisine art.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={recipe.image}
                alt={recipe.dishName}
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={() => setFailedImage(recipe.image)}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${regionGradient(recipe.region)}`}>
                <div className="bg-dots absolute inset-0 opacity-30" />
                <span className="absolute inset-0 grid place-items-center text-[7rem] drop-shadow-xl">{recipe.flag}</span>
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-sand px-3 py-1">
                {recipe.flag} {recipe.cuisine}
                {recipe.region ? ` · ${recipe.region}` : ""}
              </span>
              <span className="rounded-full bg-ink px-3 py-1 text-cream">
                {sourceBadge(recipe)}
              </span>
              <span className="rounded-full bg-saffron-soft px-3 py-1">
                {recipe.style === "one-stop" ? "🛒 One-stop shop" : "🧭 Authentic first"}
              </span>
            </div>
            <h2 className="mt-4 font-display text-[2.4rem] font-semibold leading-tight tracking-tight">{recipe.dishName}</h2>
            <p className="mt-2 leading-relaxed text-muted">{recipe.description}</p>
            {recipe.source && (recipe.source.kind === "web" || recipe.source.kind === "themealdb") && (
              <p className="mt-2 text-xs text-muted">
                Recipe adapted from{" "}
                {recipe.source.url ? (
                  <a href={recipe.source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline decoration-saffron underline-offset-2 hover:text-paprika">
                    {recipe.source.name}
                  </a>
                ) : (
                  recipe.source.name
                )}
                . Quantities and method are the original author&apos;s; swaps and store matches are Culturize&apos;s.
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <MatchRing value={recipe.authenticity} />
              <dl className="grid min-w-0 flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{s.label}</dt>
                    <dd className="font-display text-lg font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {actions && <div className="no-print mt-6 flex flex-wrap gap-2">{actions}</div>}
          </div>
        </div>
      </div>

      <div className={`${card} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-xl font-semibold">Shopping near {recipe.location.label}</h3>
          <span className="text-xs text-muted">
            {recipe.storeSource === "osm" ? "📡 Live store map · © OpenStreetMap" : "🗺️ Regional chain data"}
          </span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {recipe.shopping.map((g) => (g.store ? <StoreChip key={g.store.id} store={g.store} /> : null))}
          {otherStores.slice(0, 6).map((s) => (
            <StoreChip key={s.id} store={s} muted />
          ))}
        </div>
        {recipe.storeSource === "regional" && (
          <p className="mt-3 rounded-xl bg-saffron-soft/60 px-3 py-2 text-xs text-ink">
            We used grocery chains common in your region. Add your ZIP code or share your location for exact nearby
            stores and distances.
          </p>
        )}
      </div>

      <div className={`${card} p-5 sm:p-6`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl font-semibold">Ingredients &amp; swaps</h3>
            <p className="text-sm text-muted">
              {recipe.ingredients.length} ingredients · {recipe.swapCount} swapped · {recipe.authenticFoundCount} found authentic
            </p>
          </div>
          <div className="no-print flex rounded-full bg-sand p-1 text-xs font-semibold">
            {filterOptions.map(([key, text]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 transition ${filter === key ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"}`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>
        <ul className="mt-5 space-y-3">
          {shown.map((ing, i) => (
            <IngredientRow key={`${ing.original}-${i}`} ing={ing} />
          ))}
          {shown.length === 0 && (
            <li className="rounded-2xl border border-dashed border-clay p-6 text-center text-sm text-muted">
              Nothing in this view — every ingredient here is an easy find.
            </li>
          )}
        </ul>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className={`${card} p-5 sm:p-6`}>
          <h3 className="font-display text-2xl font-semibold">Method</h3>
          <p className="text-sm text-muted">
            Swaps are <mark className="rounded-md bg-saffron-soft px-1 text-ink">highlighted</mark> right inside the steps.
          </p>
          <ol className="mt-5 space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-sm font-semibold text-cream">
                  {i + 1}
                </span>
                <p className="pt-1 leading-relaxed text-ink/90">
                  <Highlighted text={step} phrases={recipe.swapPhrases} />
                </p>
              </li>
            ))}
          </ol>
          {recipe.tips.length > 0 && (
            <div className="mt-7 rounded-2xl bg-herb-soft/50 p-4">
              <p className="font-semibold text-herb">Kitchen notes</p>
              <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                {recipe.tips.map((t, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden="true">💡</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="self-start xl:sticky xl:top-24">
          <ShoppingList recipe={recipe} />
        </div>
      </div>
    </article>
  );
}
