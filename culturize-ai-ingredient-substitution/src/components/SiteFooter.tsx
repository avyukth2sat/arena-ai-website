import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 bg-cast text-cream/75">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Culturize helps cooks far from home recreate the dishes they grew up with — using smart swaps from the
            grocery stores down the street.
          </p>
          <p className="mt-6 font-display text-lg italic text-saffron">“Home is a flavor. We help you find it.”</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream">Cook</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-saffron" href="/kitchen">Culturize a dish</Link></li>
            <li><Link className="hover:text-saffron" href="/kitchen?mode=paste">Translate a family recipe</Link></li>
            <li><Link className="hover:text-saffron" href="/substitutes">Swap Library</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-saffron" href="/recipes">Saved cookbook</Link></li>
            <li><Link className="hover:text-saffron" href="/kitchen?mode=ingredient">Look up an ingredient</Link></li>
            <li><Link className="hover:text-saffron" href="/kitchen?mode=missing">Find a substitute</Link></li>
            <li><Link className="hover:text-saffron" href="/#how-it-works">How it works</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-cream">Good to know</h3>
          <p className="mt-4 text-sm leading-relaxed">
            Store locations © OpenStreetMap contributors. Recipes come from our library, TheMealDB, the Wikibooks Cookbook
            (CC BY-SA) and the sites we link to. Prices are estimates; availability varies by location.
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-5 py-5 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Culturize. Made for every kitchen far from home.</p>
          <p className="text-cream/50">Cook boldly. Swap wisely. Share generously.</p>
        </div>
      </div>
    </footer>
  );
}
