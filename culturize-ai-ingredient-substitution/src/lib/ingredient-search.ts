import { INGREDIENTS, matchIngredient, searchIngredients } from "@/lib/kb";
import { looksCommon, matchGeneric } from "@/lib/kb/generic";
import { lookupWikipediaEntry } from "@/lib/recipe-sources";
import { availabilityLabel } from "@/lib/kb/stores";
import type { IngredientSearchResult } from "@/lib/types";
import { whereToFind } from "@/lib/engine";

function libraryResult(
  query: string,
  item: (typeof INGREDIENTS)[number],
  encyclopedia: Awaited<ReturnType<typeof lookupWikipediaEntry>>,
): IngredientSearchResult {
  return {
    query,
    name: item.name,
    kind: "library",
    category: item.category,
    cuisines: item.cuisines,
    where: whereToFind(item.foundAt),
    description: item.description ?? encyclopedia?.extract ?? null,
    image: encyclopedia?.image ?? null,
    articleUrl: encyclopedia?.url ?? null,
    articleTitle: encyclopedia?.title ?? null,
    substitutes: item.substitutes.map((s) => ({
      name: s.name,
      match: s.match,
      ratio: s.ratio,
      why: s.why,
      foundLabel: availabilityLabel(s.foundAt),
    })),
  };
}

/** Search the local ingredient encyclopedia first, then broad Wikipedia food entries. */
export async function lookupIngredient(query: string): Promise<IngredientSearchResult> {
  const q = query.trim().slice(0, 100);
  const hit = matchIngredient(q);
  if (hit) {
    const preferredTitle = hit.ing.id === "moong-dal" ? "Mung bean" : undefined;
    const wiki = await lookupWikipediaEntry(preferredTitle ?? hit.ing.name, preferredTitle);
    return libraryResult(q, hit.ing, wiki);
  }

  const generic = matchGeneric(q);
  const wiki = await lookupWikipediaEntry(q);
  if (generic) {
    return {
      query: q,
      name: q,
      kind: "generic",
      category: generic.category,
      cuisines: [],
      where: whereToFind(generic.tags),
      description: wiki?.extract ?? null,
      image: wiki?.image ?? null,
      articleUrl: wiki?.url ?? null,
      articleTitle: wiki?.title ?? null,
      substitutes: generic.substitutes.map((s) => ({
        name: s.name,
        match: s.match,
        ratio: s.ratio,
        why: s.why,
        foundLabel: availabilityLabel(s.foundAt),
      })),
    };
  }

  const common = looksCommon(q);
  return {
    query: q,
    name: wiki?.title ?? q,
    kind: wiki ? (common ? "common" : "encyclopedia") : common ? "common" : "unknown",
    category: common ? "Everyday ingredient" : null,
    cuisines: [],
    where: common ? "most U.S. supermarkets" : null,
    description:
      wiki?.extract ??
      (common
        ? "A commonly stocked grocery item. Add a cuisine or dish name to look for a more specific regional ingredient match."
        : null),
    image: wiki?.image ?? null,
    articleUrl: wiki?.url ?? null,
    articleTitle: wiki?.title ?? null,
    substitutes: [],
  };
}

export function ingredientSuggestions(query: string, limit = 6) {
  return searchIngredients(query, limit).map((ing) => ({
    name: ing.name,
    cuisine: ing.cuisines.slice(0, 3).join(" · ") || null,
    flag: "🥬",
    kind: "ingredient" as const,
    source: "ingredient-library" as const,
  }));
}
