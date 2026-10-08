"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { btnPrimary } from "./ui";

export default function HeroSearch() {
  const router = useRouter();
  const [dish, setDish] = useState("");
  const [zip, setZip] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (dish.trim()) params.set("dish", dish.trim());
    if (/^\d{5}$/.test(zip)) params.set("zip", zip);
    if (dish.trim()) params.set("go", "1");
    router.push(`/kitchen${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="mt-8 flex flex-col gap-1 rounded-[1.75rem] border border-clay bg-white p-2 shadow-[0_24px_50px_-30px_rgba(33,26,21,0.55)] sm:flex-row sm:items-center"
    >
      <label className="flex flex-1 items-center gap-3 rounded-2xl px-4 py-2.5 focus-within:bg-sand/60">
        <span aria-hidden="true" className="text-xl">🍲</span>
        <span className="sr-only">Dish you want to cook</span>
        <input
          value={dish}
          onChange={(e) => setDish(e.target.value)}
          placeholder="Any dish or recipe link — from any cuisine"
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/60"
        />
      </label>
      <div className="hidden h-8 w-px bg-clay sm:block" />
      <label className="flex items-center gap-3 rounded-2xl px-4 py-2.5 focus-within:bg-sand/60 sm:w-40">
        <span aria-hidden="true" className="text-xl">📍</span>
        <span className="sr-only">ZIP code</span>
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          inputMode="numeric"
          placeholder="ZIP code"
          className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/60"
        />
      </label>
      <button type="submit" className={`${btnPrimary} px-6 py-3.5 text-[15px]`}>
        Culturize it <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
