import { allowsChildren, apartments, defaultTerms, termsOf, posts as sitePosts, reviews as siteReviews } from "@/lib/data";
import { NOW } from "./format";
import type { Booking, DB, HostApplication, Inquiry, Listing, Post, Review } from "./types";

// SAMPLE DATA ONLY — no database is connected yet. Listings, posts and reviews
// mirror the public site (lib/data.ts); the rest is made up for the demo.
const ago = (hours: number) => new Date(Date.parse(NOW) - hours * 3_600_000).toISOString();

const siteListings: Listing[] = apartments.map((a) => ({
  id: a.slug,
  title: a.title,
  slug: a.slug,
  neighborhood: a.neighborhood,
  borough: a.borough,
  beds: a.beds,
  baths: a.baths,
  sqft: a.sqft,
  price: a.price,
  availableFrom: a.availableFrom,
  status: "published",
  featured: !!a.featured,
  childrenAllowed: allowsChildren(a),
  ...termsOf(a),
  images: a.images,
  description: a.about.join("\n\n"),
  amenities: a.amenities,
  updatedAt: ago(24 * 6),
}));

const extraListings: Listing[] = [
  {
    id: "sunny-studio-astoria",
    title: "Sunny Studio near Astoria Park",
    slug: "sunny-studio-astoria",
    neighborhood: "Astoria",
    borough: "Brooklyn",
    beds: 0,
    baths: 1,
    sqft: 380,
    price: 2900,
    availableFrom: "2026-12-10",
    status: "draft",
    featured: false,
    childrenAllowed: true,
    ...defaultTerms({ beds: 0, price: 2900 }),
    images: ["/images/stock/furnished-interior.jpg", "/images/stock/nyc-neighborhood.jpg"],
    description: "Draft listing — photos and copy still being finalized with the host.",
    amenities: ["Wi‑Fi", "Air conditioning", "Dedicated workspace"],
    updatedAt: ago(30),
  },
  {
    id: "garden-1br-park-slope",
    title: "Garden-Level 1 Bedroom in Park Slope",
    slug: "garden-1br-park-slope",
    neighborhood: "Park Slope",
    borough: "Brooklyn",
    beds: 1,
    baths: 1,
    sqft: 640,
    price: 3900,
    availableFrom: "2026-09-01",
    status: "archived",
    featured: false,
    childrenAllowed: true,
    ...defaultTerms({ beds: 1, price: 3900 }),
    smokingAllowed: true,
    specialInstructions: "Garden entrance is separate from the main building. Host lives upstairs.",
    images: ["/images/stock/nyc-apartment-living.jpg", "/images/stock/apartment-main.jpg"],
    description: "Host paused this unit after the lease ended.",
    amenities: ["Wi‑Fi", "Pets allowed", "Washer/dryer in unit"],
    updatedAt: ago(24 * 40),
  },
];

const bookings: Booking[] = [
  { id: "bk_1001", guestName: "Priya Raman", email: "priya.raman@example.com", phone: "+1 415 555 0132", listingId: "bright-and-sunny-2-bedroom-2-bath-unit", checkIn: "2026-11-15", checkOut: "2027-01-15", adults: 2, children: 1, status: "new", message: "Relocating for work at a hospital nearby. Would love a flexible move-in if possible.", notes: "", createdAt: ago(3) },
  { id: "bk_1002", guestName: "Tom Becker", email: "tbecker@example.com", phone: "+44 7700 900123", listingId: "newly-renovated-2-bedroom-apartment-in-lower-east-side", checkIn: "2026-11-02", checkOut: "2026-12-05", adults: 2, children: 0, status: "new", message: "Two colleagues, visiting for a project.", notes: "", createdAt: ago(7) },
  { id: "bk_1003", guestName: "Amara Okafor", email: "amara.o@example.com", phone: "+1 646 555 0188", listingId: "loft-style-1-bedroom-williamsburg", checkIn: "2026-11-20", checkOut: "2027-02-20", adults: 1, children: 0, status: "contacted", message: "Is the loft quiet at night? I work remotely.", notes: "Called 11/1, waiting on ID and employer letter.", createdAt: ago(30) },
  { id: "bk_1004", guestName: "Lucas Ferreira", email: "lucas.f@example.com", phone: "+55 11 99999 0101", listingId: "2-bed-1bath-furnished-apartment-in-midtown-west", checkIn: "2026-11-03", checkOut: "2026-12-10", adults: 2, children: 0, status: "confirmed", message: "", notes: "Deposit received. Keys via lockbox.", createdAt: ago(24 * 4) },
  { id: "bk_1005", guestName: "Hannah Lee", email: "hannah.lee@example.com", phone: "+1 212 555 0170", listingId: "modern-1-bedroom-jersey-city-waterfront", checkIn: "2026-11-18", checkOut: "2027-01-18", adults: 1, children: 0, status: "confirmed", message: "Moving from Seattle.", notes: "", createdAt: ago(24 * 6) },
  { id: "bk_1006", guestName: "Diego Alvarez", email: "diego.a@example.com", phone: "+34 600 123 456", listingId: "cozy-studio-greenpoint", checkIn: "2026-12-01", checkOut: "2027-01-05", adults: 1, children: 0, status: "declined", message: "", notes: "Dates overlap an existing confirmed stay.", createdAt: ago(24 * 8) },
  { id: "bk_1007", guestName: "Olivia Chen", email: "olivia.chen@example.com", phone: "+1 718 555 0144", listingId: "spacious-3-bedroom-concourse-bronx", checkIn: "2026-11-12", checkOut: "2027-01-12", adults: 2, children: 3, status: "contacted", message: "Family of five relocating, need three bedrooms.", notes: "", createdAt: ago(24 * 2) },
  { id: "bk_1008", guestName: "Marcus Webb", email: "marcus.webb@example.com", phone: "+1 917 555 0166", listingId: "sophisticated-2br-furnished-apartment-in-ues", checkIn: "2026-11-09", checkOut: "2026-12-12", adults: 2, children: 0, status: "cancelled", message: "", notes: "Guest cancelled — job start date moved.", createdAt: ago(24 * 10) },
];

const inquiries: Inquiry[] = [
  { id: "in_2001", type: "corporate", name: "Rachel Stein", email: "rstein@brightpath.example", company: "BrightPath Consulting", message: "We have 6 consultants arriving in January for a 3-month engagement. Looking for 3 two-bedrooms near Midtown.", status: "new", createdAt: ago(2) },
  { id: "in_2002", type: "contact", name: "Daniel Kim", email: "daniel.kim@example.com", message: "Do you allow dogs in the Williamsburg loft? Ours is 20 lbs.", status: "new", createdAt: ago(9) },
  { id: "in_2003", type: "relocation", name: "Sofia Marino", email: "sofia.m@example.com", company: "Lumen Health", message: "Our new hire arrives Dec 1. Need a move-in-ready one-bedroom near Upper East Side hospitals.", status: "in-progress", createdAt: ago(26) },
  { id: "in_2004", type: "contact", name: "Jordan Bell", email: "jbell@example.com", message: "Can I extend my stay by two weeks? Currently in the Midtown West unit.", status: "in-progress", createdAt: ago(50) },
  { id: "in_2005", type: "newsletter", name: "—", email: "newsletter.fan@example.com", message: "Subscribed from the footer form.", status: "resolved", createdAt: ago(72) },
  { id: "in_2006", type: "contact", name: "Mei Tanaka", email: "mei.tanaka@example.com", message: "Thanks for the quick reply — all set!", status: "resolved", createdAt: ago(24 * 5) },
];

const hosts: HostApplication[] = [
  { id: "ho_3001", name: "Gregory Hall", email: "g.hall@example.com", phone: "+1 718 555 0199", address: "214 Bedford Ave, Brooklyn, NY", borough: "Brooklyn", beds: 2, expectedRent: 4800, message: "Fully renovated two-bedroom, currently vacant. Happy to furnish to Nestly standards.", status: "pending", createdAt: ago(12) },
  { id: "ho_3002", name: "Elena Petrova", email: "elena.p@example.com", phone: "+1 201 555 0110", address: "88 Hudson St, Jersey City, NJ", borough: "New Jersey", beds: 1, expectedRent: 3500, message: "Waterfront one-bedroom with gym and doorman.", status: "pending", createdAt: ago(40) },
  { id: "ho_3003", name: "Samuel Osei", email: "s.osei@example.com", phone: "+1 347 555 0123", address: "1020 Grand Concourse, Bronx, NY", borough: "Bronx", beds: 3, expectedRent: 4100, message: "Three-bedroom, pre-war building, near D train.", status: "approved", createdAt: ago(24 * 9) },
  { id: "ho_3004", name: "Linda Shaw", email: "linda.shaw@example.com", phone: "+1 212 555 0155", address: "310 E 86th St, New York, NY", borough: "Manhattan", beds: 0, expectedRent: 2700, message: "Studio, no photos yet.", status: "rejected", createdAt: ago(24 * 15) },
];

const stays = ["Manhattan Apt", "Lower East Side", "Brooklyn Suite", "Luxury Penthouse", "Studio Apt", "Cozy Loft"];
const reviews: Review[] = [
  ...siteReviews.map<Review>((r, i) => ({
    id: `rv_${4001 + i}`,
    name: r.name,
    stay: r.role.replace("Stayed in ", ""),
    rating: i % 3 === 0 ? 4 : 5,
    text: r.text,
    status: "published",
    createdAt: ago(24 * (20 + i * 3)),
  })),
  { id: "rv_4101", name: "Kevin Walsh", stay: stays[1], rating: 5, text: "Great location and the host was responsive. Would stay again.", status: "pending", createdAt: ago(5) },
  { id: "rv_4102", name: "Anonymous", stay: stays[2], rating: 1, text: "Terrible!!! Visit my site for cheap deals http://spam.example", status: "pending", createdAt: ago(22) },
];

const posts: Post[] = sitePosts.map((p, i) => ({
  id: `po_${5001 + i}`,
  slug: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  category: p.category,
  body: p.body.join("\n\n"),
  image: p.image,
  status: "published",
  date: p.date,
}));
posts.push({
  id: "po_5099",
  slug: "winter-in-nyc-furnished-rentals",
  title: "Winter in NYC: what to know before a long stay",
  excerpt: "Heating, packing, and the neighborhoods that feel best in January.",
  category: "Guides",
  body: "Draft — outline in progress.",
  image: "/images/blog/blog1.jpg",
  status: "draft",
  date: "2026-11-01",
});

export const seedDB: DB = {
  listings: [...siteListings, ...extraListings],
  bookings,
  inquiries,
  hosts,
  reviews,
  posts,
  settings: {
    siteName: "Nestly",
    supportEmail: "hello@nestly.nyc",
    phone: "+1 (212) 555-0100",
    minStayDays: 30,
    bookingsOpen: true,
    notifyBookings: true,
    notifyInquiries: true,
    notifyHosts: false,
  },
};
