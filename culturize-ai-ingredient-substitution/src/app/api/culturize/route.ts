import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDb } from "@/db/ensure";
import { searchLogs } from "@/db/schema";
import { aiEnabled, culturizeWithAI } from "@/lib/ai";
import { culturizeDish, culturizePaste, culturizeRaw } from "@/lib/engine";
import { dishSummary, findDish } from "@/lib/kb";
import { findMealDbRecipe, findOpenRecipe, importRecipeFromUrl, looksLikeUrl } from "@/lib/recipe-sources";
import { findNearbyStores } from "@/lib/stores";
import type { CulturizedRecipe, CulturizeResponse, DishSummary, ShoppingStyle } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bad = (error: string) => NextResponse.json<CulturizeResponse>({ ok: false, error }, { status: 400 });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("Invalid request body.");
  }

  const mode = body.mode === "paste" ? "paste" : "dish";
  const dish = String(body.dish ?? "").trim().slice(0, 300);
  const cuisine = typeof body.cuisine === "string" && body.cuisine.trim() ? body.cuisine.trim().slice(0, 60) : undefined;
  const style: ShoppingStyle = body.style === "one-stop" ? "one-stop" : "authentic";
  const servingsNum = Number(body.servings);
  const servings = Number.isFinite(servingsNum) && servingsNum > 0 ? servingsNum : undefined;
  const zipRaw = typeof body.zip === "string" ? body.zip.trim() : "";
  const zip = /^\d{5}$/.test(zipRaw) ? zipRaw : undefined;
  const lat = typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : undefined;
  const lon = typeof body.lon === "number" && Number.isFinite(body.lon) ? body.lon : undefined;
  const ingredientsText = String(body.ingredientsText ?? "").slice(0, 8000);
  const stepsText = String(body.stepsText ?? "").slice(0, 12000);

  if (mode === "dish" && !dish) return bad("Tell us which dish you want to cook.");
  if (mode === "paste" && !ingredientsText.trim()) return bad("Paste your family recipe's ingredient list first.");

  const isUrl = mode === "dish" && looksLikeUrl(dish);

  // Start the (cached) store lookup in parallel with the recipe search.
  const storesPromise = findNearbyStores({ zip, lat, lon });

  let recipe: CulturizedRecipe | null = null;
  let suggestions: DishSummary[] | undefined;
  let failure: string | null = null;

  if (mode === "dish") {
    if (isUrl) {
      try {
        const raw = await importRecipeFromUrl(dish);
        recipe = culturizeRaw(raw, await storesPromise, servings, style);
      } catch (err) {
        failure = err instanceof Error ? err.message : "We couldn't read that link.";
      }
    } else {
      const found = findDish(dish, cuisine);
      if (found.dish) {
        recipe = culturizeDish(found.dish, await storesPromise, servings, style);
      } else {
        const raw = await findMealDbRecipe(dish).catch(() => null);
        if (raw) {
          recipe = culturizeRaw(raw, await storesPromise, servings, style);
        } else if (aiEnabled()) {
          recipe = await culturizeWithAI({ dish, cuisine, servings: servings ?? 4, style }, await storesPromise);
        }
        if (!recipe) {
          const web = await findOpenRecipe(dish, cuisine).catch(() => null);
          if (web) recipe = culturizeRaw(web, await storesPromise, servings, style);
        }
      }
      if (!recipe) suggestions = found.suggestions.map(dishSummary);
    }
  } else {
    const storesResult = await storesPromise;
    if (aiEnabled()) {
      recipe = await culturizeWithAI(
        { dish: dish || "Family recipe", cuisine, ingredientsText, stepsText, servings: servings ?? 4, style },
        storesResult,
      );
    }
    recipe ??= culturizePaste({ dishName: dish, cuisine, ingredientsText, stepsText, servings }, storesResult, style);
  }

  try {
    await ensureDb();
    const stores = await storesPromise;
    await db.insert(searchLogs).values({
      query: (recipe?.dishName ?? (dish || "Family recipe")).slice(0, 200),
      mode: isUrl ? "link" : mode,
      cuisine: cuisine ?? recipe?.cuisine ?? null,
      zip: stores.location.zip ?? zip ?? null,
      found: Boolean(recipe),
      engine: recipe?.engine ?? null,
    });
  } catch (err) {
    console.error("search log failed", err);
  }

  if (!recipe) {
    return NextResponse.json<CulturizeResponse>({
      ok: false,
      error: failure ?? `We couldn't find a recipe for “${dish}”.`,
      suggestions,
    });
  }
  return NextResponse.json<CulturizeResponse>({ ok: true, recipe });
}
