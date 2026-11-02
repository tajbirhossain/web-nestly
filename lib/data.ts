// Content ported from the WordPress build (dev.nestly.nyc).

const S = "/images/stock";

export type Borough = "Manhattan" | "Bronx" | "Brooklyn" | "New Jersey";
export const boroughs: Borough[] = ["Manhattan", "Bronx", "Brooklyn", "New Jersey"];

export type Apartment = {
  slug: string;
  title: string;
  address?: string;
  neighborhood: string;
  borough: Borough;
  beds: number; // 0 = studio
  baths: number;
  sqft: number;
  price: number; // per month
  lat: number;
  lng: number;
  availableFrom: string; // ISO date
  images: string[];
  about: string[];
  highlights?: string[];
  amenities: string[];
  featured?: boolean;
  /** Hosts can block children. Undefined means children are welcome. */
  childrenAllowed?: boolean;
  /** Per-listing fees and house rules. Anything omitted falls back to defaultTerms(). */
  terms?: Partial<Terms>;
};

export type Cancellation = "flexible" | "moderate" | "strict";
export const cancellationInfo: Record<Cancellation, { label: string; text: string }> = {
  flexible: { label: "Flexible", text: "Free cancellation up to 14 days before move-in. After that, the first month's rent is non-refundable." },
  moderate: { label: "Moderate", text: "Free cancellation up to 30 days before move-in. After that, the first month's rent is non-refundable." },
  strict: { label: "Strict", text: "Free cancellation within 48 hours of confirming if move-in is 60+ days away. After that, the first month's rent is non-refundable." },
};

/** Fees, occupancy and house rules shown on a listing and used when booking. */
export type Terms = {
  cleaningFee: number; // one-time, charged with the first month
  securityDeposit: number; // refundable, held until move-out
  utilitiesIncluded: boolean;
  maxGuests: number;
  minGuestAge: number; // minimum age of the primary guest
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  checkInTime: string;
  checkOutTime: string;
  cancellation: Cancellation;
  specialInstructions: string;
};

/** Sensible starting terms for a home; sample data and new admin listings both begin here. */
export const defaultTerms = (a: { beds: number; price: number }): Terms => ({
  cleaningFee: [150, 200, 275][a.beds] ?? 350,
  securityDeposit: a.price,
  utilitiesIncluded: true,
  maxGuests: Math.max(2, a.beds * 2),
  minGuestAge: 18,
  smokingAllowed: false,
  partiesAllowed: false,
  checkInTime: "3:00 PM",
  checkOutTime: "11:00 AM",
  cancellation: "moderate",
  specialInstructions: "",
});

export const termsOf = (a: Pick<Apartment, "beds" | "price" | "terms">): Terms => ({ ...defaultTerms(a), ...a.terms });

/** Amenities that can be filtered on (and get icons). Listings use these exact strings. */
export const featureFilters = [
  "Wi‑Fi",
  "Air conditioning",
  "Fully equipped kitchen",
  "Washer/dryer in unit",
  "Dishwasher",
  "Dedicated workspace",
  "Pets allowed",
  "Doorman",
  "Gym",
  "Towels & linens provided",
] as const;

// SAMPLE LISTINGS — the client confirmed these are placeholders (based on the WP
// dev site). Replace with a CMS/API feed before launch.
const IMG = {
  living: `${S}/nyc-apartment-living.jpg`,
  interior: `${S}/furnished-interior.jpg`,
  work: `${S}/modern-workspace.jpg`,
  skyline: `${S}/nyc-skyline-apt.jpg`,
  hood: `${S}/nyc-neighborhood.jpg`,
  main: `${S}/apartment-main.jpg`,
  feature: `${S}/feature-img.jpg`,
};

const fillPhotos = (imgs: string[]) => [...imgs, ...Object.values(IMG).filter((i) => !imgs.includes(i))].slice(0, 5);

const listings: Apartment[] = [
  {
    slug: "bright-and-sunny-2-bedroom-2-bath-unit",
    title: "Bright and Sunny 2 Bedroom 2 Bath Unit",
    neighborhood: "Upper East Side",
    borough: "Manhattan",
    beds: 2,
    baths: 2,
    sqft: 1150,
    price: 7950,
    lat: 40.7736,
    lng: -73.9566,
    availableFrom: "2026-11-15",
    images: [IMG.living, IMG.interior, IMG.work, IMG.skyline, IMG.feature],
    about: [
      "The building offers everything the sophisticated New Yorker could hope for in a luxury rental. A great selection of pet friendly upscale apartment rentals and a variety of unique floor plans meet your needs, and lavish amenities provide an oasis of convenience in your busy life.",
      "Residents are surrounded by breathtaking panoramic views of the city's vibrant skyline with access to 24-hour concierge services. Amenities include a health and fitness center with a private BBQ terrace, an indoor swimming pool, a rooftop sun terrace and a private entertainment lounge.",
    ],
    highlights: [
      "Oversized windows for maximum light and unprecedented views",
      "Gourmet granite kitchens with microwaves and self-cleaning ovens",
      "Ceramic tile baths with marble vanities and tri-view mirrors",
      "Walk-in and customized closets",
    ],
    amenities: ["Wi‑Fi", "Air conditioning", "Fully equipped kitchen", "Washer/dryer in unit", "Dishwasher", "Pets allowed", "Doorman", "Gym", "Towels & linens provided", "Live TV", "Iron", "Bathtub"],
    featured: true,
  },
  {
    slug: "newly-renovated-2-bedroom-apartment-in-lower-east-side",
    title: "Newly Renovated 2 Bedroom Apartment in Lower East Side",
    neighborhood: "Lower East Side",
    borough: "Manhattan",
    beds: 2,
    baths: 2,
    sqft: 950,
    price: 5500,
    lat: 40.7157,
    lng: -73.9863,
    availableFrom: "2026-11-02",
    images: [IMG.main, IMG.interior, IMG.hood, IMG.work],
    about: [
      "This renovated two bedroom, two bath apartment in the Lower East Side is fully furnished with everything you could need during your stay in NYC. It is steps away from an abundance of amazing cafés, great restaurants, and local shops.",
    ],
    amenities: ["Wi‑Fi", "Air conditioning", "Fully equipped kitchen", "Dishwasher", "Towels & linens provided"],
    featured: true,
  },
  {
    slug: "sophisticated-2br-furnished-apartment-in-ues",
    title: "Sophisticated 2BR Furnished Apartment in UES",
    address: "East 92nd St",
    neighborhood: "Upper East Side",
    borough: "Manhattan",
    beds: 2,
    baths: 1,
    sqft: 880,
    price: 6000,
    lat: 40.7816,
    lng: -73.9502,
    availableFrom: "2026-11-09",
    images: [IMG.interior, IMG.living, IMG.main, IMG.skyline, IMG.work],
    about: [
      "A sophisticated, fully furnished two bedroom on the Upper East Side, set up for a comfortable month-plus stay with a full kitchen, linens and everything you need from day one.",
    ],
    amenities: ["Wi‑Fi", "Air conditioning", "Fully equipped kitchen", "Towels & linens provided", "Heating", "Iron", "Hair dryer", "Refrigerator", "Wide screen TV"],
    featured: true,
    terms: { securityDeposit: 3000, specialInstructions: "Doorman building — guests show ID at the front desk. Move-ins by appointment, weekdays 9 AM–5 PM." },
  },
  {
    slug: "2-bed-1bath-furnished-apartment-in-midtown-west",
    title: "2 Bed 1 Bath Furnished Apartment in Midtown West",
    address: "Ninth Ave",
    neighborhood: "Midtown",
    borough: "Manhattan",
    beds: 2,
    baths: 1,
    sqft: 820,
    price: 5500,
    lat: 40.7587,
    lng: -73.9973,
    availableFrom: "2026-11-03",
    images: [IMG.work, IMG.skyline, IMG.interior, IMG.living],
    about: [
      "Experience comfortable Manhattan living in this charming 2-bedroom, 1-bathroom apartment in the heart of Midtown West, near Hudson Yards. Situated in a classic New York City pre-war building, it offers a welcoming living space, a functional kitchen and a convenient layout — an excellent choice for professionals, couples, roommates, or anyone looking to experience city living.",
      "The prime location provides easy access to Times Square, Hudson Yards, Penn Station, and some of Manhattan's best restaurants, cafés, shopping, and entertainment.",
    ],
    highlights: [
      "2 bedrooms and 1 bathroom",
      "Comfortable living and dining area",
      "Functional kitchen",
      "Classic Manhattan pre-war building",
      "Convenient access to public transportation",
    ],
    amenities: ["Wi‑Fi", "Air conditioning", "Fully equipped kitchen", "Dedicated workspace", "Towels & linens provided"],
  },
  {
    slug: "loft-style-1-bedroom-williamsburg",
    title: "Loft-Style 1 Bedroom with Skyline Views",
    neighborhood: "Williamsburg",
    borough: "Brooklyn",
    beds: 1,
    baths: 1,
    sqft: 700,
    price: 4400,
    lat: 40.7143,
    lng: -73.9614,
    availableFrom: "2026-11-20",
    images: [IMG.skyline, IMG.work, IMG.interior, IMG.hood],
    about: [
      "High ceilings, big windows and open space a few blocks from the waterfront and the L train. A creative, light-filled loft ready for a month or longer.",
    ],
    amenities: ["Wi‑Fi", "Air conditioning", "Fully equipped kitchen", "Washer/dryer in unit", "Dedicated workspace", "Pets allowed"],
    featured: true,
    childrenAllowed: false,
    terms: { minGuestAge: 25, specialInstructions: "Quiet hours 10 PM–8 AM. Please remove shoes inside; the building has no elevator (4th-floor walk-up)." },
  },
  {
    slug: "cozy-studio-greenpoint",
    title: "Cozy Studio in Greenpoint",
    neighborhood: "Greenpoint",
    borough: "Brooklyn",
    beds: 0,
    baths: 1,
    sqft: 420,
    price: 3300,
    lat: 40.7304,
    lng: -73.9544,
    availableFrom: "2026-12-01",
    images: [IMG.hood, IMG.interior, IMG.living],
    about: [
      "Quiet charm with skyline views — a smartly laid-out studio for a solo traveler or remote worker who wants to settle into a neighborhood.",
    ],
    amenities: ["Wi‑Fi", "Air conditioning", "Dedicated workspace", "Towels & linens provided"],
    childrenAllowed: false,
  },
  {
    slug: "spacious-3-bedroom-concourse-bronx",
    title: "Spacious 3 Bedroom Near Yankee Stadium",
    neighborhood: "Concourse",
    borough: "Bronx",
    beds: 3,
    baths: 2,
    sqft: 1100,
    price: 4200,
    lat: 40.8296,
    lng: -73.9262,
    availableFrom: "2026-11-12",
    images: [IMG.living, IMG.feature, IMG.main, IMG.interior],
    about: [
      "Room for the whole team or family: a bright three bedroom with a full kitchen, steps from the subway and a quick ride to Midtown.",
    ],
    amenities: ["Wi‑Fi", "Air conditioning", "Fully equipped kitchen", "Dishwasher", "Pets allowed", "Towels & linens provided"],
  },
  {
    slug: "modern-1-bedroom-jersey-city-waterfront",
    title: "Modern 1 Bedroom with Manhattan Views",
    neighborhood: "Jersey City",
    borough: "New Jersey",
    beds: 1,
    baths: 1,
    sqft: 690,
    price: 3700,
    lat: 40.7178,
    lng: -74.0431,
    availableFrom: "2026-11-18",
    terms: { cancellation: "strict", minGuestAge: 21, cleaningFee: 225 },
    images: [IMG.skyline, IMG.work, IMG.living, IMG.hood],
    about: [
      "A polished one bedroom on the Jersey City waterfront with skyline views and the PATH train to Manhattan minutes away.",
    ],
    amenities: ["Wi‑Fi", "Air conditioning", "Fully equipped kitchen", "Dedicated workspace", "Doorman", "Gym"],
  },
];

export const apartments: Apartment[] = listings.map((a) => ({ ...a, images: fillPhotos(a.images) }));

/** "Master bedroom — King bed" style rows, derived from the bedroom count (sample data). */
export const bedroomRows = (a: Apartment) =>
  a.beds === 0
    ? [{ name: "Sleeping area", bed: "Queen bed", photo: a.images[1] ?? a.images[0] }]
    : Array.from({ length: a.beds }, (_, i) => ({
        name: i === 0 ? "Primary bedroom" : `Bedroom ${i + 1}`,
        bed: i === 0 ? "King bed" : "Queen bed",
        photo: a.images[(i + 1) % a.images.length],
      }));

/** Neighborhoods that currently have at least one listing, for filters. */
export const listedAreas = [...new Set(apartments.map((a) => a.neighborhood))];

/** Max guests: the listing's own limit, defaulting to 2 per bedroom (min 2) since the WP ACF field is not in the export. */
export const capacity = (a: Apartment) => termsOf(a).maxGuests;

export const allowsChildren = (a: Pick<Apartment, "childrenAllowed">) => a.childrenAllowed !== false;
export const getApartment = (slug: string) => apartments.find((a) => a.slug === slug);
export const bedLabel = (b: number) => (b === 0 ? "Studio" : `${b} Bed${b > 1 ? "s" : ""}`);
export const money = (n: number) => `$${n.toLocaleString("en-US")}`;

export const neighborhoods = [
  { name: "Upper East Side", borough: "Manhattan", blurb: "Quiet streets, classic living, near the park.", image: `${S}/nyc-apartment-living.jpg` },
  { name: "Upper West Side", borough: "Manhattan", blurb: "Residential calm with easy transit.", image: `${S}/nyc-neighborhood.jpg` },
  { name: "Midtown", borough: "Manhattan", blurb: "Central for workdays and late nights.", image: `${S}/nyc-skyline-apt.jpg` },
  { name: "Lower East Side", borough: "Manhattan", blurb: "Energy, restaurants, and downtown access.", image: `${S}/apartment-main.jpg` },
  { name: "Gramercy / Murray Hill", borough: "Manhattan", blurb: "Polished and walkable.", image: `${S}/furnished-interior.jpg` },
  { name: "Village", borough: "Manhattan", blurb: "West & East Village character.", image: `${S}/modern-workspace.jpg` },
  { name: "Williamsburg", borough: "Brooklyn", blurb: "Creative energy across the river.", image: `${S}/nyc-skyline-apt.jpg` },
  { name: "Greenpoint", borough: "Brooklyn", blurb: "Quiet charm with skyline views.", image: `${S}/nyc-neighborhood.jpg` },
  { name: "Concourse", borough: "Bronx", blurb: "Roomy apartments by the subway and Yankee Stadium.", image: `${S}/nyc-apartment-living.jpg` },
  { name: "Jersey City", borough: "New Jersey", blurb: "Waterfront views and the PATH train to Manhattan.", image: `${S}/nyc-skyline-apt.jpg` },
];

export const features = [
  { title: "Effortless booking", text: "Request a stay and we confirm availability with you directly.", icon: "/images/3d/calendar.png" },
  { title: "Wi‑Fi included", text: "Work-ready internet and a dedicated space to focus.", icon: "/images/3d/wifi.png" },
  { title: "Curated interiors", text: "Professionally furnished and cleaned before you arrive.", icon: "/images/3d/couch.png" },
  { title: "Neighborhood access", text: "Live where New York actually happens — not a hotel corridor.", icon: "/images/3d/map.png" },
];

export const steps = [
  { n: "01", title: "Search", text: "Filter by neighborhood, size, and dates across Nestly homes." },
  { n: "02", title: "Request", text: "Submit a booking request for a stay of 30 days or more." },
  { n: "03", title: "We confirm", text: "Our team contacts you to finalize details and availability." },
  { n: "04", title: "Move in", text: "Arrive to a furnished, cleaned apartment ready for living." },
];

export const faqs = [
  { q: "What is the minimum stay?", a: "Nestly stays are a minimum of 30 days." },
  { q: "How does booking work?", a: "Submit a request to book. Our team reviews availability and contacts you to confirm — there is no instant online payment checkout yet." },
  { q: "Are utilities included?", a: "Most Nestly apartments include utilities and high-speed Wi‑Fi. We'll confirm details when we follow up on your request." },
  { q: "How do I become a host?", a: "Apply on the Become a Host page. We review applications manually before you can list." },
  { q: "Can I leave a review?", a: "Yes. Share feedback on our Reviews page and on individual apartments." },
  { q: "Do you offer corporate housing?", a: "Yes — share headcount, dates, and preferred neighborhoods and we'll put together options for your team." },
];

export const logos = [
  { name: "Google", src: "/images/logos/google-logo.svg" },
  { name: "Goldman Sachs", src: "/images/logos/goldman-logo.svg" },
  { name: "EY", src: "/images/logos/ey-logo.svg" },
  { name: "BCG", src: "/images/logos/bcg-logo.svg" },
  { name: "Tesla", src: "/images/logos/tesla-logo.svg" },
  { name: "Uber", src: "/images/logos/uber-logo.svg" },
];

// Testimonials from the WordPress homepage (dev.nestly.nyc). These are the
// client's draft/placeholder reviews — replace with verified guest reviews.
export const reviews = [
  { name: "John Doe", role: "Stayed in Manhattan Apt", text: "The apartment was absolutely spotless and beautifully styled. The location was perfect for checking out local restaurants. Highly recommended!" },
  { name: "Sarah Jenkins", role: "Stayed in Lower East Side", text: "Communication with the host was incredibly smooth. The space felt exactly like the photos — cozy, premium, and well-lit. Will book again." },
  { name: "Michael R.", role: "Stayed in Brooklyn Suite", text: "Incredible value for the price. Fast Wi‑Fi, premium amenities, and a very comfortable bed. Perfect for remote working or a quick getaway." },
  { name: "Emma Watson", role: "Stayed in Luxury Penthouse", text: "An absolute gem! The terrace view was stunning, and check-in was incredibly automated and simple. 10/10 stay." },
  { name: "David K.", role: "Stayed in Studio Apt", text: "Incredibly well-designed space. It makes perfect use of space and felt much larger than it is. Super close to the subway station." },
  { name: "Jessica M.", role: "Stayed in Cozy Loft", text: "Clean, quiet, and peaceful. The host provided great local recommendations. Perfect for an extended stay while traveling." },
];

export const lifestyles = [
  { kicker: "Live with Nestly", title: "Year-round comfort, curated for you", text: "Enjoy the stability of a beautifully furnished home with flexible annual leasing options that fit your life.", image: "/images/blog/blog1.jpg", href: "/apartments" },
  { kicker: "Nestly for business", title: "Work seamlessly, stay effortlessly", text: "Premium corporate housing equipped with high-speed setups and spaces designed to maximize your productivity.", image: "/images/blog/blog2.jpg", href: "/corporate" },
  { kicker: "Nestly executive", title: "Relocate without the friction", text: "Move-in-ready premium suites featuring custom executive workspaces and seamless utility integration from day one.", image: "/images/blog/blog3.jpg", href: "/relocation" },
];

export const hostSteps = [
  { title: "List Your Space", text: "It's quick and easy", icon: "/images/3d/house.png" },
  { title: "Welcome Guests", text: "Provide great stays", icon: "/images/3d/handshake.png" },
  { title: "Earn More", text: "Maximize your income", icon: "/images/3d/money.png" },
];

export const posts = [
  {
    slug: "how-to-choose-30-day-furnished-stay-nyc",
    title: "How to choose a 30+ day furnished stay in NYC",
    excerpt: "Plan your housing like a project, not a weekend trip — neighborhood, inclusions, and how booking works.",
    image: "/images/blog/blog1.jpg",
    date: "2026-09-24",
    category: "Guides",
    body: [
      "New York rewards people who plan their housing like a project, not a weekend trip. If you need a place for 30 days or longer, a Nestly furnished apartment is built for that rhythm — utilities on, kitchen stocked for real cooking, and a host team that confirms every stay personally.",
      "## Start with neighborhood fit",
      "Upper East Side for quieter residential blocks, Lower Manhattan for walkable downtown energy, or ask us for UWS / Brooklyn options as inventory grows. Match commute, parks, and grocery access to how you actually live.",
      "## Ask about what's included",
      "Most Nestly homes include utilities and high-speed Wi‑Fi. Confirm beds, desks, and laundry before you request to book so there are no surprises on move-in day.",
      "## Request to book — we confirm",
      "There is no instant checkout. Submit dates and guests, and Nestly follows up to lock availability. That human step is intentional for month-plus stays.",
    ],
  },
  {
    slug: "ues-vs-lower-manhattan-extended-stay",
    title: "Upper East Side vs Lower Manhattan for an extended stay",
    excerpt: "Both neighborhoods work beautifully — the right pick depends on pace and proximity.",
    image: "/images/blog/blog2.jpg",
    date: "2026-09-24",
    category: "Neighborhoods",
    body: [
      "Both neighborhoods work beautifully for a Nestly stay — the right pick depends on pace and proximity.",
      "## Upper East Side",
      "Tree-lined streets, museum culture, and a calmer evening rhythm. Ideal if you want residential comfort with easy access to Midtown.",
      "## Lower Manhattan / Lower East Side",
      "Dense restaurants, nightlife, and transit. Better if your days are downtown meetings or you want the city humming outside your door.",
      "## How Nestly helps",
      "Browse live listings on Apartments, then request to book with your move-in and move-out dates (30+ days). We'll confirm the apartment that fits.",
    ],
  },
  {
    slug: "corporate-housing-without-hotel-fatigue",
    title: "Corporate housing without the hotel fatigue",
    excerpt: "Hotels are built for nights. Nestly is built for months.",
    image: "/images/blog/blog3.jpg",
    date: "2026-09-24",
    category: "Corporate",
    body: [
      "Hotels are built for nights. Nestly is built for months — space to work, cook, and decompress after long assignment days.",
      "## What corporate guests get",
      "Move-in ready furnishings. Reliable Wi‑Fi for remote work. Neighborhood living instead of a lobby loop. A single Nestly contact for booking confirmation.",
      "## Next step",
      "Share dates and headcount on our Corporate page or Contact form. We'll recommend apartments that match your brief.",
    ],
  },
];

/** "Where" picker options: the four areas Nestly covers, with how many homes are live in each. */
export const areaOptions: { value: string; label: string; hint?: string }[] = [
  { value: "", label: "Anywhere", hint: `${apartments.length} homes across ${boroughs.length} areas` },
  ...boroughs.map((b) => {
    const count = apartments.filter((a) => a.borough === b).length;
    return { value: b, label: b, hint: count ? `${count} home${count > 1 ? "s" : ""}` : "Coming soon" };
  }),
];

/** Price bounds (rounded to $500) and listing prices, for the budget slider and its histogram. */
export const PRICE_STEP = 500;
export const PRICE_MIN = Math.floor(Math.min(...apartments.map((a) => a.price)) / PRICE_STEP) * PRICE_STEP;
export const PRICE_MAX = Math.ceil(Math.max(...apartments.map((a) => a.price)) / PRICE_STEP) * PRICE_STEP;
export const listingPrices = apartments.map((a) => a.price);
