import { db, pool } from "@/db";
import { recipes } from "@/db/schema";
import { culturizeDish } from "@/lib/engine";
import { DISH_BY_ID } from "@/lib/kb";
import { regionalStoresResult } from "@/lib/stores";
import type { ShoppingStyle } from "@/lib/types";

/** Mirrors src/db/schema.ts so the app self-heals even if `drizzle-kit push` hasn't run. */
const DDL = `
CREATE TABLE IF NOT EXISTS "recipes" (
  "id" serial PRIMARY KEY NOT NULL,
  "dish_name" text NOT NULL,
  "cuisine" text NOT NULL,
  "country" text,
  "flag" text,
  "authenticity" integer NOT NULL,
  "swap_count" integer DEFAULT 0 NOT NULL,
  "location_label" text,
  "zip" text,
  "engine" text NOT NULL,
  "data" jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE IF NOT EXISTS "search_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "query" text NOT NULL,
  "mode" text NOT NULL,
  "cuisine" text,
  "zip" text,
  "found" boolean DEFAULT true NOT NULL,
  "engine" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
`;

const SEED_RECIPES: { dish: string; zip: string; label: string; style: ShoppingStyle; servings: number }[] = [
  { dish: "pho-bo", zip: "98104", label: "Seattle, WA", style: "authentic", servings: 6 },
  { dish: "chicken-biryani", zip: "60601", label: "Chicago, IL", style: "one-stop", servings: 6 },
  { dish: "mole-poblano", zip: "90012", label: "Los Angeles, CA", style: "authentic", servings: 8 },
  { dish: "kimchi-jjigae", zip: "30096", label: "Duluth, GA", style: "authentic", servings: 4 },
  { dish: "egusi-soup", zip: "77036", label: "Houston, TX", style: "authentic", servings: 6 },
  { dish: "jollof-rice", zip: "43229", label: "Columbus, OH", style: "authentic", servings: 6 },
];

const globalForEnsure = globalThis as typeof globalThis & { __culturizeEnsure?: Promise<void> };

export function ensureDb(): Promise<void> {
  if (!globalForEnsure.__culturizeEnsure) {
    globalForEnsure.__culturizeEnsure = init().catch((err) => {
      globalForEnsure.__culturizeEnsure = undefined;
      throw err;
    });
  }
  return globalForEnsure.__culturizeEnsure;
}

async function init(): Promise<void> {
  await pool.query(DDL);

  const recipeCount = await pool.query<{ n: number }>("select count(*)::int as n from recipes");
  if (recipeCount.rows[0].n === 0) {
    const now = Date.now();
    for (const [i, seed] of SEED_RECIPES.entries()) {
      const dish = DISH_BY_ID.get(seed.dish);
      if (!dish) continue;
      const recipe = culturizeDish(dish, regionalStoresResult(seed.zip, seed.label), seed.servings, seed.style);
      await db.insert(recipes).values({
        dishName: recipe.dishName,
        cuisine: recipe.cuisine,
        country: recipe.country,
        flag: recipe.flag,
        authenticity: recipe.authenticity,
        swapCount: recipe.swapCount,
        locationLabel: seed.label,
        zip: seed.zip,
        engine: recipe.engine,
        data: recipe,
        createdAt: new Date(now - (SEED_RECIPES.length - i) * 7 * 3600 * 1000),
      });
    }
  }

}
