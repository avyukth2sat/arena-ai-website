import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDb } from "@/db/ensure";
import { recipes } from "@/db/schema";

export const dynamic = "force-dynamic";

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  await ensureDb();
  const [row] = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
  if (!row) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  return NextResponse.json({ recipe: row });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ error: "Invalid id." }, { status: 400 });
  await ensureDb();
  const deleted = await db.delete(recipes).where(eq(recipes.id, id)).returning({ id: recipes.id });
  if (deleted.length === 0) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
