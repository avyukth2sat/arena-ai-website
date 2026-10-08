import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { btnPrimary, eyebrow } from "@/components/ui";
import { db } from "@/db";
import { ensureDb } from "@/db/ensure";
import { recipes } from "@/db/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cookbook",
  description: "Recipes culturized by cooks across America — with smart swaps from their local stores.",
};

function timeAgo(date: Date): string {
  const diff = (date.getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return "just now";
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const cuisine = typeof sp.cuisine === "string" ? sp.cuisine : "";

  await ensureDb();
  const cuisines = await db.selectDistinct({ cuisine: recipes.cuisine }).from(recipes).orderBy(recipes.cuisine);
  const rows = await db
    .select({
      id: recipes.id,
      dishName: recipes.dishName,
      cuisine: recipes.cuisine,
      flag: recipes.flag,
      authenticity: recipes.authenticity,
      swapCount: recipes.swapCount,
      locationLabel: recipes.locationLabel,
      engine: recipes.engine,
      createdAt: recipes.createdAt,
    })
    .from(recipes)
    .where(cuisine ? eq(recipes.cuisine, cuisine) : undefined)
    .orderBy(desc(recipes.createdAt))
    .limit(60);

  return (
    <main>
      <section className="border-b border-clay/60 bg-sand/50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-6 px-5 py-12">
          <div>
            <p className={eyebrow}>The Community Cookbook</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              Home cooking, culturized.
            </h1>
            <p className="mt-3 max-w-2xl text-muted">
              Every recipe here was rebuilt around real stores in a real American town. Open one to see the swaps,
              the shopping list and the method.
            </p>
          </div>
          <Link href="/kitchen" className={btnPrimary}>
            + Culturize a new dish
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        {cuisines.length > 1 && (
          <div className="flex flex-wrap gap-2">
            <Link
              href="/recipes"
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${!cuisine ? "bg-ink text-cream" : "border border-clay bg-white text-muted hover:text-ink"}`}
            >
              All cuisines
            </Link>
            {cuisines.map((c) => (
              <Link
                key={c.cuisine}
                href={`/recipes?cuisine=${encodeURIComponent(c.cuisine)}`}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${cuisine === c.cuisine ? "bg-ink text-cream" : "border border-clay bg-white text-muted hover:text-ink"}`}
              >
                {c.cuisine}
              </Link>
            ))}
          </div>
        )}

        {rows.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-clay bg-white p-12 text-center">
            <p className="text-5xl">📖</p>
            <h2 className="mt-4 font-display text-3xl font-semibold">The cookbook is waiting for you</h2>
            <p className="mt-2 text-muted">Culturize a dish and save it — it&apos;ll appear here for everyone.</p>
            <Link href="/kitchen" className={`${btnPrimary} mt-6`}>
              Open the kitchen →
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <Link
                key={r.id}
                href={`/recipes/${r.id}`}
                className="group flex flex-col rounded-3xl border border-clay/70 bg-white p-5 transition hover:-translate-y-1 hover:border-saffron hover:shadow-[0_24px_50px_-30px_rgba(33,26,21,0.5)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sand text-3xl">{r.flag ?? "🍲"}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      r.authenticity >= 90 ? "bg-herb-soft text-herb" : "bg-saffron-soft text-[#8a5a12]"
                    }`}
                  >
                    {r.authenticity}% flavor match
                  </span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold leading-tight group-hover:text-paprika">
                  {r.dishName}
                </h2>
                <p className="text-sm text-muted">{r.cuisine}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5 text-xs text-muted">
                  <span className="rounded-full bg-sand px-2.5 py-1">📍 {r.locationLabel ?? "USA"}</span>
                  <span className="rounded-full bg-sand px-2.5 py-1">🔄 {r.swapCount} swaps</span>
                  {r.engine === "openai" && <span className="rounded-full bg-sand px-2.5 py-1">✨ AI</span>}
                  <span className="rounded-full px-1 py-1">{timeAgo(r.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
