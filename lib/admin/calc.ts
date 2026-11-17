import { daysBetween } from "./format";
import type { Booking, Listing } from "./types";

export const nightsOf = (b: Pick<Booking, "checkIn" | "checkOut">) => Math.max(0, daysBetween(b.checkIn, b.checkOut));

/**
 * Value of a stay (rent + one-time cleaning fee; the refundable deposit is excluded).
 * Bookings priced by the server carry a stored quote, which is used as-is so later price
 * edits never change it. Older bookings without a quote keep their original estimate:
 * monthly rent prorated per night over a 30-day month.
 */
export const bookingValue = (b: Booking, listing?: Listing) =>
  b.quote ? b.quote.totalCents / 100 : listing ? legacyBookingValue(b, listing) : 0;

export const legacyBookingValue = (b: Booking, listing: Listing) => (listing.price / 30) * nightsOf(b) + listing.cleaningFee;

/** Problems with a booking request given the listing's rules; empty when it fits. */
export function bookingIssues(b: Booking, listing?: Listing): string[] {
  if (!listing) return [];
  const issues: string[] = [];
  if (b.children > 0 && !listing.childrenAllowed) issues.push("This home doesn't allow children, but the request includes " + b.children + ".");
  if (b.adults + b.children > listing.maxGuests) issues.push(`Party of ${b.adults + b.children} exceeds the ${listing.maxGuests}-guest limit.`);
  return issues;
}

/** "2 adults · 1 child" */
export const guestSummary = (b: Pick<Booking, "adults" | "children">) =>
  [
    `${b.adults} adult${b.adults === 1 ? "" : "s"}`,
    ...(b.children ? [`${b.children} child${b.children === 1 ? "" : "ren"}`] : []),
  ].join(" · ");

export const byId = <T extends { id: string }>(items: T[]) => new Map(items.map((i) => [i.id, i]));

export const matches = (q: string, ...fields: (string | undefined)[]) => {
  const needle = q.trim().toLowerCase();
  return !needle || fields.some((f) => f?.toLowerCase().includes(needle));
};
