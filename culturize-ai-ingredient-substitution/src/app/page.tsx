import { and, count, desc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import HeroSearch from "@/components/HeroSearch";
import { btnPrimary, btnSecondary, eyebrow } from "@/components/ui";
import { db } from "@/db";
import { ensureDb } from "@/db/ensure";
import { recipes, searchLogs } from "@/db/schema";
import { FEATURED_SWAP_IDS, INGREDIENT_BY_ID, KB_STATS } from "@/lib/kb";
import { availabilityLabel } from "@/lib/kb/stores";

export const dynamic = "force-dynamic";

async function loadHomeData() {
  try {
    await ensureDb();
    const [{ n }] = await db.select({ n: count() }).from(recipes);
    const recent = await db
      .select({
        id: recipes.id,
        dishName: recipes.dishName,
        cuisine: recipes.cuisine,
        flag: recipes.flag,
        authenticity: recipes.authenticity,
        swapCount: recipes.swapCount,
        locationLabel: recipes.locationLabel,
      })
      .from(recipes)
      .orderBy(desc(recipes.createdAt))
      .limit(3);
    const trending = await db
      .select({ query: searchLogs.query, n: count() })
      .from(searchLogs)
      .where(and(eq(searchLogs.found, true), eq(searchLogs.mode, "dish")))
      .groupBy(searchLogs.query)
      .orderBy(desc(count()))
      .limit(6);
    return { recipeCount: n, recent, trending };
  } catch (err) {
    console.error("home data failed", err);
    return { recipeCount: 0, recent: [], trending: [] };
  }
}

const FEATURED_SWAPS = FEATURED_SWAP_IDS.map((id) => INGREDIENT_BY_ID.get(id))
  .filter((i) => i !== undefined)
  .map((ing) => ({ ing, sub: ing.substitutes[0] }));

const STEPS = [
  {
    n: "01",
    title: "Tell us the dish",
    body: "Pick from our kitchen library — jollof, phở, mole, mansaf and more — or paste your family's handwritten recipe.",
    icon: "🍲",
  },
  {
    n: "02",
    title: "We scan stores near you",
    body: "From your ZIP we map nearby supermarkets and international markets, and what each one typically stocks.",
    icon: "🛒",
  },
  {
    n: "03",
    title: "Cook with smart swaps",
    body: "Get the recipe rewritten around flavor-matched substitutes, with a store-by-store list, aisles and prices.",
    icon: "✨",
  },
];

const PERSONAS = [
  {
    title: "The homesick student",
    body: "First semester away and craving your mom's egusi? We'll get you most of the way there with the Walmart by campus.",
    emoji: "🎒",
  },
  {
    title: "The new parent",
    body: "Pass your culture down one meal at a time — without a two-hour drive to the nearest international market.",
    emoji: "🍼",
  },
  {
    title: "The second-gen cook",
    body: "Translate Grandma's handwritten recipe into a shopping list for the store you actually go to.",
    emoji: "📜",
  },
];

export default async function HomePage() {
  const { recipeCount, recent, trending } = await loadHomeData();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-dots absolute inset-0 opacity-70" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-saffron/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-16">
          <div className="animate-rise">
            <p className={eyebrow}>The grocery translator for home cooks</p>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[1.02] tracking-tight text-ink">
              Cook the taste of <span className="italic text-paprika">home</span> — from the store down the street.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Can&apos;t find scotch bonnets, gochugaru or makrut lime leaves? Culturize scans the grocery stores near
              you and rebuilds your recipe with the closest-tasting swaps — aisle, price and flavor match included. Search any dish, or paste a link to any recipe online.
            </p>
            <HeroSearch />
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <Link href="/kitchen" className="rounded-full border border-clay bg-white/70 px-3 py-1 font-medium hover:border-paprika hover:text-paprika">🍲 Search any dish</Link>
              <Link href="/kitchen?mode=ingredient" className="rounded-full border border-clay bg-white/70 px-3 py-1 font-medium hover:border-paprika hover:text-paprika">🥬 Look up an ingredient</Link>
              <Link href="/kitchen?mode=missing" className="rounded-full border border-clay bg-white/70 px-3 py-1 font-medium hover:border-paprika hover:text-paprika">🔁 Find a missing-ingredient swap</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(33,26,21,0.6)] ring-1 ring-ink/10 sm:aspect-[5/4] lg:aspect-[4/5]">
              <Image
                src="/images/hero.jpg"
                alt="A family table filled with home-cooked dishes from around the world"
                fill
                loading="eager"
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -left-3 top-8 w-64 animate-float rounded-2xl border border-clay bg-white/95 p-4 shadow-xl backdrop-blur sm:-left-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-saffron">Smart swap · 92% match</p>
              <p className="mt-1.5 text-sm text-muted line-through decoration-paprika/60">Scotch bonnet peppers</p>
              <p className="font-display text-lg font-semibold leading-tight">Habanero peppers</p>
              <p className="mt-2 text-xs text-muted">🏬 Walmart · Produce · 0.8 mi</p>
            </div>
            <div className="absolute -right-2 bottom-24 w-60 animate-float rounded-2xl border border-clay bg-white/95 p-4 shadow-xl backdrop-blur [animation-delay:1.5s] sm:-right-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-herb">✓ Authentic find</p>
              <p className="mt-1 font-display text-lg font-semibold leading-tight">Gochugaru</p>
              <p className="mt-2 text-xs text-muted">🥢 H Mart · International · 1.2 mi</p>
            </div>
            <div className="absolute bottom-5 left-5 rounded-full bg-ink/85 px-4 py-2 text-xs font-semibold text-cream backdrop-blur">
              Flavor match <span className="text-saffron">94%</span> · 3 swaps · $38 est.
            </div>
          </div>
        </div>
      </section>

      {/* Swap ticker */}
      <section aria-label="Example swaps" className="overflow-hidden border-y border-ink bg-ink py-4 text-cream">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap text-sm">
          {[...FEATURED_SWAPS, ...FEATURED_SWAPS].map(({ ing, sub }, i) => (
            <span key={`${ing.id}-${i}`} className="inline-flex items-center gap-3">
              <span className="text-cream/60">{ing.short}</span>
              <span className="text-saffron">→</span>
              <span className="font-semibold">{sub.name}</span>
              <span className="rounded-full bg-cream/10 px-2 py-0.5 text-xs text-saffron">{sub.match}%</span>
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] ring-1 ring-ink/10 sm:aspect-[16/11] lg:aspect-[4/5]">
            <Image
              src="/images/market.jpg"
              alt="A shopper choosing peppers in an American supermarket"
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className={eyebrow}>How it works</p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Your home kitchen, translated for American aisles.
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Most diaspora cooks know the feeling: the recipe is in your heart, but half the ingredients are an ocean
              away. Culturize closes that gap with a flavor knowledge base built from how families actually cook abroad.
            </p>
            <ol className="mt-10 space-y-5">
              {STEPS.map((s) => (
                <li key={s.n} className="flex gap-5 rounded-3xl border border-clay/70 bg-white p-5">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-saffron-soft text-2xl">{s.icon}</span>
                  <div>
                    <p className="text-xs font-semibold tracking-[0.16em] text-paprika">STEP {s.n}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/kitchen" className={`${btnPrimary} mt-8`}>
              Open the kitchen <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Swap library preview */}
      <section className="bg-sand/70 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className={eyebrow}>The Swap Library</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {KB_STATS.ingredients} hard-to-find ingredients, decoded.
              </h2>
            </div>
            <Link href="/substitutes" className={btnSecondary}>
              Browse all swaps <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_SWAPS.slice(0, 8).map(({ ing, sub }) => (
              <Link
                key={ing.id}
                href={`/substitutes?q=${encodeURIComponent(ing.short)}`}
                className="group rounded-3xl border border-clay/70 bg-white p-5 transition hover:-translate-y-0.5 hover:border-saffron"
              >
                <p className="text-xs font-medium text-muted">{ing.cuisines.slice(0, 2).join(" · ")}</p>
                <p className="mt-2 text-sm text-muted line-through decoration-paprika/50">{ing.name}</p>
                <p className="mt-0.5 font-display text-lg font-semibold leading-snug group-hover:text-paprika">{sub.name}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                    <div className="h-full rounded-full bg-gradient-to-r from-saffron to-paprika" style={{ width: `${sub.match}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-ink">{sub.match}%</span>
                </div>
                <p className="mt-3 text-xs text-muted">📍 {availabilityLabel(sub.foundAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Open-ended search */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-8 rounded-[2rem] border border-clay/70 bg-white p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className={eyebrow}>A world of home cooking</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              No fixed menu. Bring the dish you&apos;re actually craving.
            </h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Search a dish name, ingredient, regional spelling or paste a recipe link. Culturize checks its recipe library,
              global cookbooks and the open web — then matches hard-to-find ingredients to stores near you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 lg:max-w-xs">
            <Link href="/kitchen" className={btnPrimary}>Find a dish →</Link>
            <Link href="/kitchen?mode=ingredient" className={btnSecondary}>Look up an ingredient</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="grid gap-px overflow-hidden rounded-[2rem] bg-clay/70 ring-1 ring-clay/70 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: KB_STATS.ingredients, l: "curated ingredients — plus open-ended food search" },
            { v: KB_STATS.substitutes, l: "flavor-matched substitutes" },
            { v: "∞", l: "dishes — search by name or paste any recipe link" },
            { v: recipeCount, l: "recipes in the community cookbook" },
          ].map((s) => (
            <div key={s.l} className="bg-white p-8">
              <p className="font-display text-5xl font-semibold text-paprika">{s.v}</p>
              <p className="mt-2 text-sm text-muted">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent + trending */}
      {recent.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={eyebrow}>Fresh from the community</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Recently culturized</h2>
            </div>
            <Link href="/recipes" className={btnSecondary}>
              Open the cookbook <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {recent.map((r) => (
              <Link
                key={r.id}
                href={`/recipes/${r.id}`}
                className="flex items-center gap-4 rounded-3xl border border-clay/70 bg-white p-5 transition hover:-translate-y-0.5 hover:border-saffron"
              >
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sand text-3xl">{r.flag ?? "🍲"}</span>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold">{r.dishName}</p>
                  <p className="truncate text-sm text-muted">
                    {r.cuisine} · {r.locationLabel ?? "USA"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-herb">
                    {r.authenticity}% flavor match · {r.swapCount} swaps
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {trending.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-muted">🔥 Trending in the kitchen:</span>
              {trending.map((t) => (
                <Link
                  key={t.query}
                  href={`/kitchen?dish=${encodeURIComponent(t.query)}`}
                  className="rounded-full bg-saffron-soft px-3 py-1 font-medium text-ink hover:bg-saffron"
                >
                  {t.query}
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Personas */}
      <section className="mx-auto max-w-7xl px-5 pb-20">
        <p className={eyebrow}>Made for</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight">Everyone cooking far from home</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PERSONAS.map((p) => (
            <div key={p.title} className="rounded-3xl border border-clay/70 bg-white p-7">
              <span className="text-4xl">{p.emoji}</span>
              <h3 className="mt-4 font-display text-2xl font-semibold">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-ink">
          <Image src="/images/swap.jpg" alt="" fill sizes="100vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/30" />
          <div className="relative max-w-2xl px-8 py-16 sm:px-14 sm:py-20">
            <h2 className="font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
              Your grandmother&apos;s recipe.
              <br />
              <span className="italic text-saffron">Your neighborhood store.</span>
            </h2>
            <p className="mt-5 max-w-lg text-cream/75">
              Paste the recipe exactly as your family writes it. We&apos;ll find every ingredient — or its closest
              match — within a few miles of you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/kitchen" className={btnPrimary}>
                Culturize a dish <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/kitchen?mode=paste"
                className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-cream/10"
              >
                Translate a family recipe
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
