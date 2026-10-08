import { flagForCuisine } from "@/lib/cuisines";
import { finalizeRecipe, toRef } from "@/lib/engine";
import type { CulturizedRecipe, IngredientStatus, RecipeIngredient, ShoppingStyle, StoresResult } from "@/lib/types";

/** Optional LLM upgrade: set OPENAI_API_KEY (and optionally OPENAI_MODEL) to culturize any dish. */
export function aiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

interface AiIngredient {
  original?: string;
  quantity?: string;
  status?: string;
  use?: string;
  ratio?: string | null;
  storeName?: string | null;
  aisle?: string;
  estPrice?: number;
  match?: number;
  why?: string | null;
  whereAuthentic?: string | null;
}

interface AiRecipe {
  error?: string;
  dishName?: string;
  cuisine?: string;
  country?: string;
  region?: string;
  description?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  difficulty?: string;
  ingredients?: AiIngredient[];
  steps?: string[];
  tips?: string[];
}

const STATUSES: IngredientStatus[] = ["easy", "authentic_nearby", "swap", "pantry"];

const SYSTEM_PROMPT = `You are Culturize, a culinary engine that helps immigrant and diaspora home cooks in the United States make dishes from their home culture using products from grocery stores near them.
You know what US chains (Walmart, Kroger, Safeway, H-E-B, Publix, Whole Foods, Trader Joe's, ALDI, Costco, Target) and specialty markets (H Mart, 99 Ranch, Patel Brothers, Fiesta, African & Caribbean markets, halal markets) typically stock.
For each ingredient choose a status:
- "easy": an ordinary US grocery item
- "authentic_nearby": a specialty item that one of the provided nearby stores likely carries
- "swap": hard to find nearby — give the best-tasting substitute sold at one of the provided stores, with a ratio and an honest flavor-match score (0-100)
- "pantry": salt, water, cooking oil and similar staples
Shopping style "one-stop" means everything must come from ONE mainstream store; "authentic" means prefer the real thing from specialty stores when one is nearby.
Write clear, numbered home-cook steps that already use the substitutes. If the request is not a real dish, return {"error":"not_a_dish"}.
Respond with JSON only, using this shape:
{"dishName":string,"cuisine":string,"country":string,"region":string,"description":string,"servings":number,"prepMinutes":number,"cookMinutes":number,"difficulty":"Easy"|"Medium"|"Weekend project","ingredients":[{"original":string,"quantity":string,"status":"easy"|"authentic_nearby"|"swap"|"pantry","use":string,"ratio":string|null,"storeName":string|null,"aisle":string,"estPrice":number,"match":number,"why":string|null,"whereAuthentic":string|null}],"steps":string[],"tips":string[]}`;

export async function culturizeWithAI(
  input: { dish: string; cuisine?: string; ingredientsText?: string; stepsText?: string; servings: number; style: ShoppingStyle },
  storesResult: StoresResult,
): Promise<CulturizedRecipe | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const payload = {
    dish: input.dish,
    cuisine: input.cuisine || null,
    servings: input.servings,
    shoppingStyle: input.style,
    location: storesResult.location.label,
    nearbyStores: storesResult.stores.map((s) => ({
      name: s.name,
      type: s.kind,
      distanceMi: s.distanceMi,
      typicallyCarries: s.tags,
    })),
    familyIngredients: input.ingredientsText || null,
    familySteps: input.stepsText || null,
  };

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(payload) },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const ai = JSON.parse(content) as AiRecipe;
    if (ai.error || !Array.isArray(ai.ingredients) || ai.ingredients.length === 0 || !Array.isArray(ai.steps)) {
      return null;
    }

    const findStore = (name?: string | null) => {
      if (!name) return null;
      const n = name.toLowerCase();
      return storesResult.stores.find((s) => s.name.toLowerCase() === n || n.includes(s.name.toLowerCase())) ?? null;
    };
    const primary = storesResult.stores.find((s) => s.tags.includes("mainstream")) ?? storesResult.stores[0] ?? null;

    const swapPhrases: string[] = [];
    const ingredients: RecipeIngredient[] = ai.ingredients
      .filter((i) => i.original)
      .slice(0, 40)
      .map((i) => {
        const status = STATUSES.includes(i.status as IngredientStatus) ? (i.status as IngredientStatus) : "easy";
        const use = i.use?.trim() || i.original!;
        if (status === "swap") swapPhrases.push(use.toLowerCase());
        const store = status === "pantry" ? null : (findStore(i.storeName) ?? primary);
        const price = typeof i.estPrice === "number" && i.estPrice > 0 ? Math.round(i.estPrice * 100) / 100 : 2.99;
        return {
          original: i.original!,
          quantity: i.quantity || "as needed",
          status,
          use,
          buy: status === "pantry" ? [] : [{ product: use, aisle: i.aisle || "Grocery", price }],
          ratio: i.ratio ?? null,
          store: store ? toRef(store) : null,
          match: status === "swap" ? Math.max(0, Math.min(100, Math.round(i.match ?? 75))) : 100,
          why: i.why ?? null,
          alternatives: [],
          authenticWhere: i.whereAuthentic ?? null,
        };
      });

    const cuisine = ai.cuisine || input.cuisine || "Home cooking";
    return finalizeRecipe({
      meta: {
        dishName: ai.dishName || input.dish,
        cuisine,
        country: ai.country ?? null,
        flag: flagForCuisine(ai.country ? `${cuisine} ${ai.country}` : cuisine),
        region: ai.region ?? null,
        description: ai.description || `${input.dish}, culturized for ${storesResult.location.label}.`,
        image: null,
        servings: Math.max(1, Math.min(24, Math.round(ai.servings ?? input.servings))),
        prepMinutes: Math.max(0, Math.round(ai.prepMinutes ?? 0)),
        cookMinutes: Math.max(0, Math.round(ai.cookMinutes ?? 0)),
        difficulty: ai.difficulty || "Medium",
      },
      ingredients,
      steps: ai.steps.filter((s) => typeof s === "string" && s.trim()).slice(0, 20),
      tips: (ai.tips ?? []).filter((s) => typeof s === "string").slice(0, 5),
      swapPhrases,
      storesResult,
      style: input.style,
      engine: "openai",
      source: { kind: "ai", name: "AI kitchen", url: null },
    });
  } catch {
    return null;
  }
}
