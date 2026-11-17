// Stay pricing, shared by the server (authoritative) and the browser (estimate only).
// Pure functions with no imports so they run the same everywhere and are easy to test.
//
// Model: a home has a base monthly price, plus optional overrides for specific
// calendar months ("2026-12" → 1500). Each night is charged at its own month's
// rate divided by that month's actual number of days, so a full calendar month
// always costs exactly that month's price. All money math runs in integer cents.

/** "YYYY-MM" */
export type MonthKey = string;
export type MonthlyPrices = Record<MonthKey, number>;

/** The pricing fields of a home, as stored in the database. */
export type PricedHome = { price: number; monthlyPrices?: MonthlyPrices; cleaningFee: number };

export type QuoteSegment = {
  month: MonthKey;
  nights: number;
  daysInMonth: number;
  /** Monthly rate applied to this month, in cents. */
  monthlyRateCents: number;
  /** True when a custom price for this month replaced the base price. */
  custom: boolean;
  amountCents: number;
};

/** A priced stay. Stored on the booking at request time so later price edits never change it. */
export type BookingQuote = {
  currency: "USD";
  checkIn: string;
  checkOut: string;
  nights: number;
  segments: QuoteSegment[];
  rentCents: number;
  cleaningFeeCents: number;
  /** Rent + cleaning fee. The refundable deposit is held separately and excluded. */
  totalCents: number;
  computedAt: string;
};

export const MONTH_KEY = /^\d{4}-(0[1-9]|1[0-2])$/;
const DAY = 86_400_000;
/** Upper bound for a single request; keeps quotes sane and the month loop short. */
export const MAX_STAY_NIGHTS = 3 * 366;

const toCents = (dollars: number) => Math.round(dollars * 100);

/** A real calendar date in strict YYYY-MM-DD form (rejects 2026-02-30). */
export function isISODate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = Date.parse(`${s}T00:00:00Z`);
  return Number.isFinite(t) && new Date(t).toISOString().slice(0, 10) === s;
}

export const daysInMonth = (year: number, month1to12: number) => new Date(Date.UTC(year, month1to12, 0)).getUTCDate();

const validPrice = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0 && n <= 1_000_000;

/** Monthly rate in dollars for one calendar month: its custom price if set, otherwise the base price. */
export function monthlyRate(home: Pick<PricedHome, "price" | "monthlyPrices">, month: MonthKey): number {
  const custom = home.monthlyPrices?.[month];
  return validPrice(custom) ? custom : home.price;
}

/**
 * Validates admin input for custom monthly prices. Returns the cleaned map (sorted
 * by month), or null when anything is invalid. Empty input becomes {}.
 */
export function sanitizeMonthlyPrices(v: unknown): MonthlyPrices | null {
  if (v === undefined || v === null) return {};
  if (typeof v !== "object" || Array.isArray(v)) return null;
  const out: MonthlyPrices = {};
  for (const [k, p] of Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) {
    if (!MONTH_KEY.test(k) || !validPrice(p)) return null;
    out[k] = p;
  }
  return out;
}

export class PricingError extends Error {}

/**
 * Prices a stay from check-in (first night) to check-out (not a night). Nights are
 * grouped by calendar month; each group is charged rate × nights / daysInMonth,
 * rounded half-up to the cent. The total is the sum of the rounded groups, so the
 * breakdown always adds up to exactly the total shown.
 */
export function quoteStay(home: PricedHome, checkIn: string, checkOut: string, now = new Date()): BookingQuote {
  if (!isISODate(checkIn) || !isISODate(checkOut)) throw new PricingError("Invalid dates");
  if (!validPrice(home.price)) throw new PricingError("This home has no valid price");
  const cleaningFee = Number.isFinite(home.cleaningFee) && home.cleaningFee >= 0 ? home.cleaningFee : 0;

  const start = Date.parse(`${checkIn}T00:00:00Z`);
  const end = Date.parse(`${checkOut}T00:00:00Z`);
  const nights = Math.round((end - start) / DAY);
  if (nights <= 0) throw new PricingError("Check-out must be after check-in");
  if (nights > MAX_STAY_NIGHTS) throw new PricingError("Stay is too long");

  const segments: QuoteSegment[] = [];
  let cursor = start;
  while (cursor < end) {
    const d = new Date(cursor);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const nextMonth = Date.UTC(y, m, 1); // month index m = the following month
    const segEnd = Math.min(end, nextMonth);
    const n = Math.round((segEnd - cursor) / DAY);
    const month = `${y}-${String(m).padStart(2, "0")}`;
    const dim = daysInMonth(y, m);
    const custom = validPrice(home.monthlyPrices?.[month]);
    const monthlyRateCents = toCents(monthlyRate(home, month));
    segments.push({ month, nights: n, daysInMonth: dim, monthlyRateCents, custom, amountCents: Math.round((monthlyRateCents * n) / dim) });
    cursor = segEnd;
  }

  const rentCents = segments.reduce((s, x) => s + x.amountCents, 0);
  const cleaningFeeCents = toCents(cleaningFee);
  return {
    currency: "USD",
    checkIn,
    checkOut,
    nights,
    segments,
    rentCents,
    cleaningFeeCents,
    totalCents: rentCents + cleaningFeeCents,
    computedAt: now.toISOString(),
  };
}

/** "$1,225.81", or "$1,225" for whole dollars. */
export function fmtCents(cents: number) {
  const whole = cents % 100 === 0;
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

/** "Dec 2026" */
export const fmtMonth = (key: MonthKey) =>
  new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
