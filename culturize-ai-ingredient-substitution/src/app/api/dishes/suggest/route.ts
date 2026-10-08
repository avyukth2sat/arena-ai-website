import { NextResponse } from "next/server";
import { searchLibrary } from "@/lib/kb";
import { ingredientSuggestions } from "@/lib/ingredient-search";
import { flagForCuisine } from "@/lib/cuisines";
import { findWikipediaFoodPages, suggestMealNames, suggestWikibooksRecipes } from "@/lib/recipe-sources";

export const dynamic = "force-dynamic";

export interface DishSuggestion {
  name: string;
  cuisine: string | null;
  flag: string;
  kind: "dish" | "ingredient";
  source: "library" | "cookbook" | "wikibooks" | "ingredient-library" | "encyclopedia";
}

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ suggestions: [] });

  const library = searchLibrary(q, 5).map<DishSuggestion>((d) => ({
    name: d.name,
    cuisine: d.cuisine,
    flag: d.flag,
    kind: "dish",
    source: "library",
  }));
  const ingredients = ingredientSuggestions(q, 5).map<DishSuggestion>((i) => ({ ...i, kind: "ingredient" }));
  const [cookbook, wikibooks, encyclopedia] = await Promise.all([
    q.length >= 3 ? suggestMealNames(q).catch(() => []) : Promise.resolve([]),
    q.length >= 3 ? suggestWikibooksRecipes(q, 4).catch(() => []) : Promise.resolve([]),
    q.length >= 3 ? findWikipediaFoodPages(q, 3).catch(() => []) : Promise.resolve([]),
  ]);

  const seen = new Set([...library, ...ingredients].map((x) => x.name.toLowerCase()));
  const webDishes = [
    ...cookbook.map((m) => ({
      name: m.name,
      cuisine: m.area,
      flag: flagForCuisine(m.area),
      kind: "dish" as const,
      source: "cookbook" as const,
    })),
    ...wikibooks.map((name) => ({
      name,
      cuisine: null,
      flag: "🍲",
      kind: "dish" as const,
      source: "wikibooks" as const,
    })),
  ].filter((item) => {
    const key = item.name.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const wikiIngredients = encyclopedia
    .filter((hit) => !seen.has(hit.title.toLowerCase()))
    .map<DishSuggestion>((hit) => ({
      name: hit.title,
      cuisine: "Food & ingredient reference",
      flag: "📚",
      kind: "ingredient",
      source: "encyclopedia",
    }));

  return NextResponse.json({ suggestions: [...library, ...ingredients, ...webDishes, ...wikiIngredients].slice(0, 12) });
}
