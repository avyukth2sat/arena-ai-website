import type { DishSummary, DishTemplate, SpecialtyIngredient } from "@/lib/types";
import { DISHES_AFRICA_AMERICAS } from "./dishes-africa-americas";
import { DISHES_ASIA_MIDEAST_EUROPE } from "./dishes-asia-mideast-europe";
import { AMERICAS_AFRICA } from "./ingredients-americas-africa";
import { ASIA_MIDEAST_EUROPE } from "./ingredients-asia-mideast-europe";
import { MORE_INGREDIENTS } from "./ingredients-more";
import { normalize, stemText } from "./text";
import { CHAINS } from "./stores";

export { normalize, stemText };

export const INGREDIENTS: SpecialtyIngredient[] = [...AMERICAS_AFRICA, ...ASIA_MIDEAST_EUROPE, ...MORE_INGREDIENTS];
export const INGREDIENT_BY_ID = new Map(INGREDIENTS.map((i) => [i.id, i]));

export const DISHES: DishTemplate[] = [...DISHES_AFRICA_AMERICAS, ...DISHES_ASIA_MIDEAST_EUROPE];
export const DISH_BY_ID = new Map(DISHES.map((d) => [d.id, d]));

export function dishSummary(d: DishTemplate): DishSummary {
  return {
    id: d.id,
    name: d.name,
    cuisine: d.cuisine,
    country: d.country,
    region: d.region,
    flag: d.flag,
    image: d.image,
    description: d.description,
    difficulty: d.difficulty,
    totalMinutes: d.prep + d.cook,
    specialtyCount: d.ingredients.filter((i) => i.kind === "kb").length,
  };
}

export const DISH_SUMMARIES: DishSummary[] = DISHES.map(dishSummary);

export const KB_STATS = {
  ingredients: INGREDIENTS.length,
  substitutes: INGREDIENTS.reduce((n, i) => n + i.substitutes.length, 0),
  dishes: DISHES.length,
  cuisines: new Set([...DISHES.map((d) => d.cuisine), ...INGREDIENTS.flatMap((i) => i.cuisines)]).size,
  chains: CHAINS.length,
};

/** Featured swaps for marketing surfaces. */
export const FEATURED_SWAP_IDS = [
  "scotch-bonnet",
  "makrut-lime",
  "paneer",
  "gochugaru",
  "sour-orange",
  "kecap-manis",
  "masarepa",
  "jameed",
  "shaoxing",
  "birista",
  "galangal",
  "sulguni",
];

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

function similarity(q: string, cand: string): number {
  if (!q || !cand) return 0;
  if (q === cand) return 1;
  const pq = ` ${q} `;
  const pc = ` ${cand} `;
  if (pq.includes(pc) && cand.length >= 3) return 0.84 + 0.15 * (cand.length / q.length);
  if (pc.includes(pq) && q.length >= 3) return 0.7 + 0.28 * (q.length / cand.length);
  const lev = 1 - levenshtein(q, cand) / Math.max(q.length, cand.length);
  const ta = new Set(q.split(" "));
  const tb = new Set(cand.split(" "));
  const inter = [...ta].filter((t) => tb.has(t)).length;
  const jaccard = inter / new Set([...ta, ...tb]).size;
  return Math.max(lev, jaccard * 0.8);
}

export function findDish(query: string, cuisine?: string): { dish: DishTemplate | null; suggestions: DishTemplate[] } {
  const q = normalize(query);
  const cz = cuisine ? normalize(cuisine) : "";
  const scored = DISHES.map((d) => {
    const names = [d.name, ...d.aliases].map(normalize);
    const score = Math.max(...names.map((n) => similarity(q, n)));
    const fields = [d.cuisine, d.country, d.region].map(normalize);
    const cuisineHit = cz ? fields.some((f) => f.includes(cz) || cz.includes(f)) : false;
    const queryCuisineHit = [d.cuisine, d.country]
      .map((x) => normalize(x).split(" ")[0])
      .some((x) => x.length > 3 && ` ${q} `.includes(` ${x} `));
    return { d, score, cuisineHit, queryCuisineHit };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  const second = scored[1];
  let dish: DishTemplate | null = null;
  if (best && best.score >= 0.72) {
    const ambiguous = second && best.score < 0.95 && best.score - second.score < 0.04;
    const cuisineMismatch = cz.length > 0 && !best.cuisineHit && best.score < 0.95;
    if (!ambiguous && !cuisineMismatch) dish = best.d;
  }
  const suggestions = [...scored]
    .sort(
      (a, b) =>
        Number(b.cuisineHit || b.queryCuisineHit) - Number(a.cuisineHit || a.queryCuisineHit) || b.score - a.score,
    )
    .slice(0, 4)
    .map((x) => x.d);
  return { dish, suggestions };
}

const ALIAS_INDEX = INGREDIENTS.flatMap((ing) =>
  [ing.short, ing.name, ...ing.aliases].map((a) => ({ alias: stemText(a), ing })),
)
  .filter((x) => x.alias.length >= 3)
  .sort((a, b) => b.alias.length - a.alias.length);

/** Find a specialty ingredient mentioned in free text (longest alias wins). */
export function matchIngredient(text: string): { ing: SpecialtyIngredient; alias: string } | null {
  const t = ` ${stemText(text)} `;
  for (const { alias, ing } of ALIAS_INDEX) {
    if (t.includes(` ${alias} `)) return { ing, alias };
  }
  return null;
}

/** Search built-in dish names, aliases, cuisines and countries. */
export function searchLibrary(query: string, limit = 6): DishTemplate[] {
  const tokens = stemText(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];
  return DISHES.filter((d) => {
    const hay = stemText([d.name, ...d.aliases, d.cuisine, d.country].join(" "));
    return tokens.every((t) => hay.includes(t));
  }).slice(0, limit);
}

/** Search every ingredient alias, including regional spellings such as moong/mung dal. */
export function searchIngredients(query: string, limit = 8): SpecialtyIngredient[] {
  const tokens = stemText(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return [];
  return INGREDIENTS
    .map((ing) => {
      const hay = stemText([ing.name, ing.short, ...ing.aliases, ...ing.cuisines].join(" "));
      const hits = tokens.filter((t) => hay.includes(t)).length;
      const exact = stemText([ing.name, ing.short, ...ing.aliases].join(" ")) === stemText(query);
      return { ing, score: hits === tokens.length ? (exact ? 2 : 1) + Math.min(hay.length, 100) / 1000 : 0 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.ing);
}
