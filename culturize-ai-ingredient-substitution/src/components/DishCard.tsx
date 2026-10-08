import Image from "next/image";
import Link from "next/link";
import type { DishSummary } from "@/lib/types";

const REGION_GRADIENTS: Record<string, string> = {
  "West Africa": "from-saffron to-paprika",
  "East Africa": "from-paprika to-plum",
  Caribbean: "from-herb to-saffron",
  "Latin America": "from-paprika to-saffron",
  "Southeast Asia": "from-herb to-[#7fae6a]",
  "East Asia": "from-plum to-paprika",
  "South Asia": "from-saffron to-[#d9682b]",
  "Middle East": "from-[#b7893f] to-herb",
  "North Africa": "from-saffron to-plum",
  Europe: "from-plum to-ink",
  Caucasus: "from-ink to-plum",
};

export function regionGradient(region: string | null | undefined): string {
  return REGION_GRADIENTS[region ?? ""] ?? "from-saffron to-paprika";
}

function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

export default function DishCard({
  dish,
  href,
  onClick,
  compact = false,
}: {
  dish: DishSummary;
  href?: string;
  onClick?: () => void;
  compact?: boolean;
}) {
  const body = (
    <>
      <div className={`relative overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        {dish.image ? (
          <Image
            src={dish.image}
            alt={dish.name}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${regionGradient(dish.region)}`}>
            <div className="bg-dots absolute inset-0 opacity-30" />
            <span className="absolute -bottom-4 -right-2 text-[7rem] leading-none opacity-90 drop-shadow-lg transition duration-500 group-hover:scale-110">
              {dish.flag}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur">
          {dish.flag} {dish.cuisine}
        </span>
        <div className="absolute inset-x-4 bottom-3 text-white">
          <h3 className={`font-display font-semibold leading-tight ${compact ? "text-lg" : "text-xl"}`}>{dish.name}</h3>
        </div>
      </div>
      {!compact && (
        <div className="flex flex-1 flex-col justify-between gap-3 p-4">
          <p className="line-clamp-2 text-sm text-muted">{dish.description}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
            <span className="rounded-full bg-sand px-2.5 py-1">⏱ {formatMinutes(dish.totalMinutes)}</span>
            <span className="rounded-full bg-saffron-soft px-2.5 py-1 text-ink">🔄 {dish.specialtyCount} specialty items</span>
            <span className="rounded-full bg-sand px-2.5 py-1">{dish.difficulty}</span>
          </div>
        </div>
      )}
    </>
  );

  const cls =
    "group flex h-full flex-col overflow-hidden rounded-3xl border border-clay/70 bg-white text-left shadow-[0_18px_40px_-30px_rgba(33,26,21,0.5)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(33,26,21,0.55)]";

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  }
  return (
    <Link href={href ?? `/kitchen?dish=${encodeURIComponent(dish.name)}`} className={cls}>
      {body}
    </Link>
  );
}
