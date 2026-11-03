import { boroughs, neighborhoods as knownAreas, type Apartment, type Borough } from "@/lib/data";

// Search facets and the neighborhoods list, derived from the live listings so
// anything added in the admin shows up in the dropdown, slider and neighborhoods page.

export type AreaOption = { value: string; label: string; hint?: string };
export type PriceMeta = { min: number; max: number; step: number; prices: number[] };
export type Neighborhood = { name: string; borough: Borough; blurb: string; image: string };

export const PRICE_STEP = 500;

export function buildAreaOptions(apartments: Apartment[]): AreaOption[] {
  return [
    { value: "", label: "Anywhere", hint: `${apartments.length} home${apartments.length === 1 ? "" : "s"} across ${boroughs.length} areas` },
    ...boroughs.map((b) => {
      const count = apartments.filter((a) => a.borough === b).length;
      return { value: b, label: b, hint: count ? `${count} home${count > 1 ? "s" : ""}` : "Coming soon" };
    }),
  ];
}

export function buildPriceMeta(apartments: Apartment[]): PriceMeta {
  const prices = apartments.map((a) => a.price);
  if (!prices.length) return { min: 0, max: PRICE_STEP * 10, step: PRICE_STEP, prices };
  return {
    min: Math.floor(Math.min(...prices) / PRICE_STEP) * PRICE_STEP,
    max: Math.ceil(Math.max(...prices) / PRICE_STEP) * PRICE_STEP,
    step: PRICE_STEP,
    prices,
  };
}

/** Curated areas first (they have written blurbs and photos), then any area that has a listing but no entry yet. */
export function buildNeighborhoods(apartments: Apartment[]): Neighborhood[] {
  const out: Neighborhood[] = [...knownAreas] as Neighborhood[];
  for (const a of apartments) {
    if (out.some((n) => n.name === a.neighborhood)) continue;
    out.push({
      name: a.neighborhood,
      borough: a.borough,
      blurb: `Furnished homes in ${a.neighborhood}, ${a.borough}.`,
      image: a.images[0] ?? "/images/stock/nyc-neighborhood.jpg",
    });
  }
  return out;
}
