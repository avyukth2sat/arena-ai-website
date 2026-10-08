import { NextResponse } from "next/server";
import { findNearbyStores } from "@/lib/stores";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const zip = url.searchParams.get("zip")?.trim() || undefined;
  const lat = parseFloat(url.searchParams.get("lat") ?? "");
  const lon = parseFloat(url.searchParams.get("lon") ?? "");
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lon);

  if (!zip && !hasCoords) {
    return NextResponse.json({ error: "Provide a ZIP code or coordinates." }, { status: 400 });
  }
  if (zip && !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Enter a 5-digit US ZIP code." }, { status: 400 });
  }

  const result = await findNearbyStores({
    zip,
    lat: hasCoords ? lat : undefined,
    lon: hasCoords ? lon : undefined,
  });
  return NextResponse.json(result);
}
