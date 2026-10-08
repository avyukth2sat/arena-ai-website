import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RecipeActions from "@/components/RecipeActions";
import RecipeView from "@/components/recipe/RecipeView";
import { db } from "@/db";
import { ensureDb } from "@/db/ensure";
import { recipes } from "@/db/schema";

export const dynamic = "force-dynamic";

async function getRecipe(rawId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) return null;
  await ensureDb();
  const [row] = await db.select().from(recipes).where(eq(recipes.id, id)).limit(1);
  return row ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const row = await getRecipe((await params).id);
  if (!row) return { title: "Recipe not found" };
  return {
    title: `${row.dishName} (culturized for ${row.locationLabel ?? "the U.S."})`,
    description: row.data.description,
  };
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const row = await getRecipe((await params).id);
  if (!row) notFound();

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <nav className="no-print mb-6 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/recipes" className="hover:text-paprika">
          Cookbook
        </Link>{" "}
        / <span className="text-ink">{row.dishName}</span>
      </nav>
      <p className="mb-4 text-sm text-muted">
        Culturized for <span className="font-semibold text-ink">{row.locationLabel ?? "the U.S."}</span> on{" "}
        {row.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
      </p>
      <RecipeView recipe={row.data} actions={<RecipeActions id={row.id} dishName={row.dishName} />} />
    </main>
  );
}
