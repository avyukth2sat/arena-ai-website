import type { Metadata } from "next";
import SubstituteExplorer, { type ExplorerItem } from "@/components/SubstituteExplorer";
import { eyebrow } from "@/components/ui";
import { toExplorerItem } from "@/lib/explorer";
import { INGREDIENTS, KB_STATS } from "@/lib/kb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ingredient Finder",
  description: "Look up cultural ingredients, learn what they are, see real reference photos, and find flavor-matched substitutes.",
};

export default async function SubstitutesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 100) : "";
  const items: ExplorerItem[] = INGREDIENTS.map(toExplorerItem);

  return (
    <main>
      <section className="border-b border-clay/60 bg-sand/50">
        <div className="mx-auto max-w-7xl px-5 py-12">
          <p className={eyebrow}>Ingredient Finder</p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Look up an ingredient from anywhere.
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Search the Culturize cultural ingredient library, then broaden to food encyclopedias when it isn&apos;t listed.
            Get plain-language descriptions, real reference photos, authentic-store tips and tested swaps where available.
            The {KB_STATS.ingredients} hand-curated entries are a starting point — not a limit.
          </p>
        </div>
      </section>
      <SubstituteExplorer items={items} initialQuery={q} />
    </main>
  );
}
