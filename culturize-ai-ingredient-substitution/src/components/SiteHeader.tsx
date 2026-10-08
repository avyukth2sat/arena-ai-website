"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { btnPrimary } from "./ui";

const NAV = [
  { href: "/kitchen", label: "Kitchen" },
  { href: "/substitutes", label: "Swap Library" },
  { href: "/recipes", label: "Cookbook" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) => !href.includes("#") && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="no-print sticky top-0 z-40 border-b border-clay/60 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" aria-label="Culturize home" className="shrink-0">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive(item.href) ? "bg-ink text-cream" : "text-muted hover:bg-sand hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/kitchen" className={`${btnPrimary} hidden sm:inline-flex`}>
          Start cooking <span aria-hidden="true">→</span>
        </Link>
      </div>
      <nav className="flex gap-1.5 overflow-x-auto px-5 pb-3 md:hidden" aria-label="Main mobile">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium ${
              isActive(item.href) ? "bg-ink text-cream" : "bg-sand text-muted"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
