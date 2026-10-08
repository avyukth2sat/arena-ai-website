import type { Metadata } from "next";
import KitchenClient from "@/components/kitchen/KitchenClient";
import { eyebrow } from "@/components/ui";
import { aiEnabled } from "@/lib/ai";
import { DISH_SUMMARIES } from "@/lib/kb";

export const metadata: Metadata = {
  title: "Kitchen",
  description: "Culturize any dish: find substitutes for hard-to-find ingredients at grocery stores near you.",
};

export default async function KitchenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const get = (key: string) => {
    const v = sp[key];
    return typeof v === "string" ? v : "";
  };
  const requestedMode = get("mode");
  const mode = requestedMode === "paste" || requestedMode === "ingredient" || requestedMode === "missing" ? requestedMode : "dish";
  const ingredient = get("ingredient").slice(0, 100);
  const dish = (mode === "ingredient" ? ingredient : get("dish")).slice(0, 120);
  const zip = /^\d{5}$/.test(get("zip")) ? get("zip") : "";

  return (
    <main>
      <section className="no-print border-b border-clay/60 bg-sand/50">
        <div className="mx-auto max-w-7xl px-5 py-10">
          <p className={eyebrow}>The Kitchen</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            What are we cooking today?
          </h1>
          <p className="mt-3 max-w-2xl text-muted">
            Tell us the dish and where you shop. We&apos;ll check the stores near you and rebuild the recipe around
            ingredients you can actually buy this afternoon.
          </p>
        </div>
      </section>
      <KitchenClient
        dishes={DISH_SUMMARIES}
        initialDish={dish}
        initialZip={zip}
        initialMode={mode}
        autoRun={Boolean(dish) && mode === "dish"}
        aiEnabled={aiEnabled()}
      />
    </main>
  );
}
