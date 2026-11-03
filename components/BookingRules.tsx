"use client";

import { createContext, useContext, type ReactNode } from "react";
import { MIN_NIGHTS } from "@/components/ui/dates";
import { PRICE_MAX, PRICE_MIN, PRICE_STEP, areaOptions as defaultAreas, listingPrices } from "@/lib/data";
import type { AreaOption, PriceMeta } from "@/lib/catalog";

// Live values the public site shares with client components: the minimum stay set in
// the admin, plus the search dropdown and price range built from current listings.
type SiteData = { minNights: number; areaOptions: AreaOption[]; price: PriceMeta };

const fallback: SiteData = {
  minNights: MIN_NIGHTS,
  areaOptions: defaultAreas,
  price: { min: PRICE_MIN, max: PRICE_MAX, step: PRICE_STEP, prices: listingPrices },
};

const Ctx = createContext<SiteData>(fallback);

export function BookingRules({ children, ...data }: SiteData & { children: ReactNode }) {
  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}

export const useMinNights = () => useContext(Ctx).minNights;
export const useSearchMeta = () => {
  const { areaOptions, price } = useContext(Ctx);
  return { areaOptions, price };
};
