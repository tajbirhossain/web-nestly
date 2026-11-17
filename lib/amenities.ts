// The amenity catalog: one place for every amenity an admin can tick, grouped the way
// guests scan a listing. Listings store amenity *names*, so never rename an existing
// entry (saved listings and search filters match on the exact string). Add new ones freely.
//
// `filter: true` items also appear as search filters on /apartments. Keep that set
// small and high-value; everything else shows on the listing page only.

export type AmenityIconKey =
  | "wifi" | "snow" | "heat" | "linens" | "iron" | "hairdryer"
  | "kitchen" | "dishwasher" | "fridge" | "microwave" | "coffee"
  | "washer" | "laundry"
  | "desk" | "chair" | "curtains" | "tv" | "bath"
  | "elevator" | "doorman" | "gym" | "pool" | "package" | "bike" | "storage" | "paw"
  | "balcony" | "tree"
  | "key" | "parking"
  | "smoke" | "co" | "extinguisher" | "firstaid"
  | "check";

export type Amenity = { name: string; icon: AmenityIconKey; filter?: boolean };
export type AmenityCategory = { title: string; items: Amenity[] };

export const amenityCatalog: AmenityCategory[] = [
  {
    title: "Essentials",
    items: [
      { name: "Wi‑Fi", icon: "wifi", filter: true },
      { name: "Air conditioning", icon: "snow", filter: true },
      { name: "Heating", icon: "heat" },
      { name: "Towels & linens provided", icon: "linens", filter: true },
      { name: "Iron", icon: "iron" },
      { name: "Hair dryer", icon: "hairdryer" },
    ],
  },
  {
    title: "Kitchen",
    items: [
      { name: "Fully equipped kitchen", icon: "kitchen", filter: true },
      { name: "Dishwasher", icon: "dishwasher", filter: true },
      { name: "Refrigerator", icon: "fridge" },
      { name: "Microwave", icon: "microwave" },
      { name: "Coffee maker", icon: "coffee" },
    ],
  },
  {
    title: "Laundry",
    items: [
      { name: "Washer/dryer in unit", icon: "washer", filter: true },
      { name: "Laundry in building", icon: "laundry", filter: true },
    ],
  },
  {
    title: "Work & rest",
    items: [
      { name: "Dedicated workspace", icon: "desk", filter: true },
      { name: "Ergonomic chair", icon: "chair" },
      { name: "Blackout curtains", icon: "curtains" },
      { name: "Smart TV", icon: "tv" },
      { name: "Bathtub", icon: "bath" },
    ],
  },
  {
    title: "Building",
    items: [
      { name: "Elevator", icon: "elevator", filter: true },
      { name: "Doorman", icon: "doorman", filter: true },
      { name: "Gym", icon: "gym", filter: true },
      { name: "Pool", icon: "pool" },
      { name: "Package room", icon: "package" },
      { name: "Bike storage", icon: "bike" },
      { name: "Storage unit", icon: "storage" },
      { name: "Pets allowed", icon: "paw", filter: true },
    ],
  },
  {
    title: "Outdoor",
    items: [
      { name: "Private balcony or terrace", icon: "balcony" },
      { name: "Roof deck or courtyard", icon: "tree" },
    ],
  },
  {
    title: "Arrival & parking",
    items: [
      { name: "Self check-in", icon: "key" },
      { name: "Parking", icon: "parking", filter: true },
    ],
  },
  {
    title: "Safety",
    items: [
      { name: "Smoke alarm", icon: "smoke" },
      { name: "Carbon monoxide alarm", icon: "co" },
      { name: "Fire extinguisher", icon: "extinguisher" },
      { name: "First-aid kit", icon: "firstaid" },
    ],
  },
];

export const allAmenities: Amenity[] = amenityCatalog.flatMap((c) => c.items);

/** Amenities offered as search filters, in catalog order. */
export const featureFilters: string[] = allAmenities.filter((a) => a.filter).map((a) => a.name);

const byName = new Map(allAmenities.map((a) => [a.name.toLowerCase(), a]));

/** Icons for names outside the catalog: older data ("Wide screen TV") and admin-added custom amenities. */
const fallback: [RegExp, AmenityIconKey][] = [
  [/wi.?fi|internet/i, "wifi"],
  [/air cond/i, "snow"],
  [/heat/i, "heat"],
  [/dishwasher/i, "dishwasher"],
  [/kitchen|cook|oven|stove/i, "kitchen"],
  [/microwave/i, "microwave"],
  [/coffee|espresso|kettle/i, "coffee"],
  [/refrigerator|fridge|freezer/i, "fridge"],
  [/in.?unit|washer|dryer/i, "washer"],
  [/laundry/i, "laundry"],
  [/workspace|desk|office/i, "desk"],
  [/chair/i, "chair"],
  [/curtain|blind|shade/i, "curtains"],
  [/\btv\b|television|streaming|netflix/i, "tv"],
  [/hair/i, "hairdryer"],
  [/iron/i, "iron"],
  [/bath|tub|shower/i, "bath"],
  [/linen|towel|bedding/i, "linens"],
  [/elevator|lift/i, "elevator"],
  [/doorman|concierge|lobby/i, "doorman"],
  [/pool|hot tub|jacuzzi/i, "pool"],
  [/gym|fitness/i, "gym"],
  [/package|mail/i, "package"],
  [/bike|bicycle/i, "bike"],
  [/storage/i, "storage"],
  [/pet|dog|cat/i, "paw"],
  [/balcony|terrace|patio/i, "balcony"],
  [/roof|courtyard|garden|yard|outdoor/i, "tree"],
  [/check.?in|keyless|lockbox|smart lock/i, "key"],
  [/parking|garage/i, "parking"],
  [/smoke/i, "smoke"],
  [/carbon|\bco\b/i, "co"],
  [/extinguisher/i, "extinguisher"],
  [/first.?aid/i, "firstaid"],
];

export function amenityIconKey(name: string): AmenityIconKey {
  return byName.get(name.trim().toLowerCase())?.icon ?? fallback.find(([re]) => re.test(name))?.[1] ?? "check";
}

const OTHER = "Other";

/** Groups a listing's amenities by catalog category (catalog order first, unknown names under "Other"). */
export function groupAmenities(names: string[]): { title: string; items: string[] }[] {
  const have = new Set(names);
  const groups = amenityCatalog
    .map((c) => ({ title: c.title, items: c.items.map((a) => a.name).filter((n) => have.has(n)) }))
    .filter((g) => g.items.length);
  const known = new Set(allAmenities.map((a) => a.name));
  const other = names.filter((n) => !known.has(n));
  return other.length ? [...groups, { title: OTHER, items: other }] : groups;
}

/** Catalog order (most important first) for short previews; unknown names go last. */
export function sortAmenities(names: string[]): string[] {
  return groupAmenities(names).flatMap((g) => g.items);
}
