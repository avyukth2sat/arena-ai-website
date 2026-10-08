"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnSecondary } from "./ui";

export default function RecipeActions({ id, dishName }: { id: number; dishName: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Remove “${dishName}” from the cookbook?`)) return;
    setDeleting(true);
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/recipes");
      router.refresh();
    } else {
      setDeleting(false);
      window.alert("Couldn't remove this recipe. Please try again.");
    }
  }

  return (
    <>
      <Link href={`/kitchen?dish=${encodeURIComponent(dishName)}`} className={btnSecondary}>
        ↻ Culturize for my stores
      </Link>
      <button type="button" onClick={copyLink} className={btnSecondary}>
        {copied ? "Link copied ✓" : "🔗 Share"}
      </button>
      <button type="button" onClick={() => window.print()} className={btnSecondary}>
        🖨 Print
      </button>
      <button
        type="button"
        onClick={remove}
        disabled={deleting}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-paprika transition hover:bg-paprika/10 disabled:opacity-60"
      >
        {deleting ? "Removing…" : "Delete"}
      </button>
    </>
  );
}
