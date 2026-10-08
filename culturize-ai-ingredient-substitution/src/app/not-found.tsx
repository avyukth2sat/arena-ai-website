import Link from "next/link";
import { btnPrimary, btnSecondary } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-3xl place-items-center px-5 py-24 text-center">
      <p className="text-6xl">🥘</p>
      <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight">This pot is empty</h1>
      <p className="mt-3 text-lg text-muted">
        We couldn&apos;t find that page or recipe. Maybe it was eaten already?
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/kitchen" className={btnPrimary}>
          Open the kitchen →
        </Link>
        <Link href="/recipes" className={btnSecondary}>
          Browse the cookbook
        </Link>
      </div>
    </main>
  );
}
