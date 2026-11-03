import { cacheLife, cacheTag } from "next/cache";
import type { Review } from "@/lib/admin/types";
import { reviews as sampleReviews } from "@/lib/data";
import { dbEnabled, sql } from "@/lib/db";

/** Never includes the reviewer's email. `listingSlug` ties a review to one home; `verified` = confirmed stay. */
export type PublicReview = { name: string; role: string; text: string; rating: number; listingSlug?: string; verified?: boolean };

// Public-site reviews: only the ones marked "published" in the admin. Falls back to
// the built-in sample reviews when the database is not set up or still empty.
const samples: PublicReview[] = sampleReviews.map((r) => ({ ...r, rating: 5 }));

export async function getReviews(): Promise<PublicReview[]> {
  "use cache";
  cacheTag("reviews");
  // `stale` must stay >= 5 min or Next treats this as dynamic and drops it from the prerender.
  cacheLife({ stale: 300, revalidate: 30, expire: 3600 });

  if (!dbEnabled) return samples;
  try {
    const rows = (await sql`select data from reviews order by created_at desc`).map((r) => r.data as Review);
    if (rows.length === 0) return samples; // fresh project: admin has not seeded yet
    return rows.filter((r) => r.status === "published").map((r) => ({ name: r.name, role: r.stay, text: r.text, rating: r.rating, listingSlug: r.listingSlug, verified: r.verifiedStay }));
  } catch (e) {
    console.error("[reviews] database read failed, using sample reviews:", e);
    return samples;
  }
}
