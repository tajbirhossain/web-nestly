import { cacheLife, cacheTag } from "next/cache";
import { apartments as sampleApartments, type Apartment, type Borough } from "@/lib/data";
import type { Listing } from "@/lib/admin/types";
import { dbEnabled, sql } from "@/lib/db";

// Public-site listings. Reads published rows from Neon (written by the admin
// panel) and falls back to the built-in sample homes when the database is not set up
// or still empty. Cached briefly; the admin also busts the "listings" tag on save.

const CENTER: Record<Borough, [number, number]> = {
  Manhattan: [40.7831, -73.9712],
  Bronx: [40.8448, -73.8648],
  Brooklyn: [40.6782, -73.9442],
  "New Jersey": [40.7178, -74.0431],
};

/** Listings made in the admin have no coordinates; spread them around their borough so pins don't stack. */
function fallbackPosition(l: Listing): [number, number] {
  let h = 0;
  for (const ch of l.slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [lat, lng] = CENTER[l.borough] ?? CENTER.Manhattan;
  return [lat + ((h % 100) - 50) / 2500, lng + (((h >> 7) % 100) - 50) / 2500];
}

function toApartment(l: Listing): Apartment {
  const [lat, lng] = l.lat != null && l.lng != null ? [l.lat, l.lng] : fallbackPosition(l);
  return {
    slug: l.slug,
    title: l.title,
    address: l.address,
    neighborhood: l.neighborhood,
    borough: l.borough,
    beds: l.beds,
    baths: l.baths,
    sqft: l.sqft,
    price: l.price,
    lat,
    lng,
    availableFrom: l.availableFrom,
    images: l.images.length ? l.images : sampleApartments[0].images.slice(0, 1),
    about: l.description.split(/\n{2,}/).filter(Boolean),
    highlights: l.highlights,
    amenities: l.amenities,
    featured: l.featured,
    childrenAllowed: l.childrenAllowed,
    terms: {
      cleaningFee: l.cleaningFee,
      securityDeposit: l.securityDeposit,
      utilitiesIncluded: l.utilitiesIncluded,
      maxGuests: l.maxGuests,
      minGuestAge: l.minGuestAge,
      smokingAllowed: l.smokingAllowed,
      partiesAllowed: l.partiesAllowed,
      checkInTime: l.checkInTime,
      checkOutTime: l.checkOutTime,
      cancellation: l.cancellation,
      specialInstructions: l.specialInstructions,
    },
  };
}

export async function getApartments(): Promise<Apartment[]> {
  "use cache";
  cacheTag("listings");
  // `stale` must stay >= 5 min or Next treats this as dynamic and drops it from the prerender.
  cacheLife({ stale: 300, revalidate: 30, expire: 3600 });

  if (!dbEnabled) return sampleApartments;
  try {
    const rows = (await sql`select data from listings order by created_at desc`).map((r) => r.data as Listing);
    if (rows.length === 0) return sampleApartments; // fresh project: admin has not seeded yet
    return rows.filter((l) => l.status === "published").map(toApartment);
  } catch (e) {
    console.error("[listings] database read failed, using sample homes:", e);
    return sampleApartments;
  }
}

export async function getApartment(slug: string) {
  return (await getApartments()).find((a) => a.slug === slug);
}
