import { cacheLife, cacheTag } from "next/cache";
import type { Booking } from "@/lib/admin/types";
import { dbEnabled, sql } from "@/lib/db";

/** A stay that is already taken: check-in day through the night before check-out. */
export type BookedRange = { start: string; end: string };

/** Always reads the database; used by the booking API to reject overlapping requests. */
export async function fetchBookedRanges(slug: string): Promise<BookedRange[]> {
  if (!dbEnabled) return [];
  try {
    // Bookings point at the listing id; match by slug too so sample and admin-made homes both work.
    const rows = await sql`
      select data from bookings
      where data->>'status' = 'confirmed'
        and (data->>'listingId' = ${slug}
             or data->>'listingId' in (select id from listings where data->>'slug' = ${slug}))`;
    return rows
      .map((r) => r.data as Booking)
      .filter((b) => b.checkIn && b.checkOut)
      .map((b) => ({ start: b.checkIn, end: b.checkOut }));
  } catch (e) {
    console.error("[availability] database read failed:", e);
    return [];
  }
}

/** Cached for listing pages; the admin busts the "bookings" tag when a booking changes. */
export async function getBookedRanges(slug: string): Promise<BookedRange[]> {
  "use cache";
  cacheTag("bookings");
  cacheLife({ stale: 300, revalidate: 30, expire: 3600 });
  return fetchBookedRanges(slug);
}

/** Back-to-back stays are fine: a new guest may check in on the day the last one checks out. */
export const overlaps = (ranges: BookedRange[], start: string, end: string) =>
  ranges.some((r) => start < r.end && end > r.start);
