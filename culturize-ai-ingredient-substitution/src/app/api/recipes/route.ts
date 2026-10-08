import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDb } from "@/db/ensure";
import { recipes } from "@/db/schema";
import type { CulturizedRecipe } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  await ensureDb();
  const cuisine = new URL(req.url).searchParams.get("cuisine");
  const base = db
    .select({
      id: recipes.id,
      dishName: recipes.dishName,
      cuisine: recipes.cuisine,
      flag: recipes.flag,
      authenticity: recipes.authenticity,
      swapCount: recipes.swapCount,
      locationLabel: recipes.locationLabel,
      createdAt: recipes.createdAt,
    })
    .from(recipes);
  const rows = await (cuisine ? base.where(eq(recipes.cuisine, cuisine)) : base).orderBy(desc(recipes.createdAt)).limit(60);
  return NextResponse.json({ recipes: rows });
}

function isRecipe(value: unknown): value is CulturizedRecipe {
  if (!value || typeof value !== "object") return false;
  const r = value as Partial<CulturizedRecipe>;
  return (
    typeof r.dishName === "string" &&
    r.dishName.length > 0 &&
    r.dishName.length <= 160 &&
    typeof r.cuisine === "string" &&
    Array.isArray(r.ingredients) &&
    Array.isArray(r.steps) &&
    typeof r.authenticity === "number"
  );
}

export async function POST(req: Request) {
  let body: { recipe?: unknown };
  try {
    body = (await req.json()) as { recipe?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (!isRecipe(body.recipe)) {
    return NextResponse.json({ error: "That doesn't look like a Culturize recipe." }, { status: 400 });
  }
  if (JSON.stringify(body.recipe).length > 200_000) {
    return NextResponse.json({ error: "Recipe is too large to save." }, { status: 413 });
  }

  await ensureDb();
  const r = body.recipe;
  const [row] = await db
    .insert(recipes)
    .values({
      dishName: r.dishName,
      cuisine: r.cuisine,
      country: r.country ?? null,
      flag: r.flag ?? null,
      authenticity: Math.max(0, Math.min(100, Math.round(r.authenticity))),
      swapCount: Math.max(0, Math.round(r.swapCount ?? 0)),
      locationLabel: r.location?.label ?? null,
      zip: r.location?.zip ?? null,
      engine: r.engine === "openai" ? "openai" : "culturize",
      data: r,
    })
    .returning({ id: recipes.id });

  return NextResponse.json({ id: row.id }, { status: 201 });
}
