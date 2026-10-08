import { NextResponse } from "next/server";
import { culturizeItems } from "@/lib/engine";
import { lookupIngredient } from "@/lib/ingredient-search";
import { findNearbyStores } from "@/lib/stores";
import type { MissingIngredientResponse, ShoppingStyle } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function jsonError(error: string, status = 400) {
  return NextResponse.json({ ok: false, error }, { status });
}

/** Ingredient encyclopedia: local cultural knowledge first, then Wikipedia for broad coverage. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ ok: false, error: "Type at least two letters." }, { status: 400 });
  const ingredient = await lookupIngredient(q);
  return NextResponse.json({ ok: true, ingredient });
}

/** Find a substitute for one missing ingredient, using the dish and nearby store context. */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError("Invalid request body.");
  }

  const dish = typeof body.dish === "string" ? body.dish.trim().slice(0, 120) : "";
  const missing = typeof body.ingredient === "string" ? body.ingredient.trim().slice(0, 120) : "";
  const cuisine = typeof body.cuisine === "string" ? body.cuisine.trim().slice(0, 60) : "";
  const zipText = typeof body.zip === "string" ? body.zip.trim() : "";
  const zip = /^\d{5}$/.test(zipText) ? zipText : undefined;
  const lat = typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : undefined;
  const lon = typeof body.lon === "number" && Number.isFinite(body.lon) ? body.lon : undefined;
  const style: ShoppingStyle = body.style === "one-stop" ? "one-stop" : "authentic";
  if (!dish) return jsonError("Tell us which dish you're making.");
  if (!missing) return jsonError("Tell us which ingredient you don't have.");

  const storesPromise = findNearbyStores({ zip, lat, lon });
  const knowledgePromise = lookupIngredient(missing);
  const storesResult = await storesPromise;
  const culturallyMatched = culturizeItems(
    {
      items: [{ qty: "", name: missing }],
      steps: [],
      meta: {
        dishName: dish,
        cuisine: cuisine || null,
        country: null,
        description: `A focused substitute search for ${missing} while making ${dish}, matched to stores near ${storesResult.location.label}.`,
        image: null,
        prepMinutes: 0,
        cookMinutes: 0,
        difficulty: "Ingredient lookup",
      },
      baseServings: null,
      servings: 1,
      source: { kind: "paste", name: "Culturize ingredient finder", url: null },
    },
    storesResult,
    style,
  );
  const [knowledge] = await Promise.all([knowledgePromise]);
  const response: MissingIngredientResponse = {
    ok: true,
    dish,
    ingredient: culturallyMatched.ingredients[0],
    knowledge,
    location: storesResult.location,
    stores: storesResult.stores,
  };
  return NextResponse.json(response);
}
