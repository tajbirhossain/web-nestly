import { describe, expect, it } from "vitest";
import { PricingError, daysInMonth, fmtCents, isISODate, monthlyRate, quoteStay, sanitizeMonthlyPrices } from "@/lib/pricing";

const home = (extra: Partial<Parameters<typeof quoteStay>[0]> = {}) => ({ price: 1000, cleaningFee: 0, ...extra });

describe("monthlyRate", () => {
  it("uses the base price when no custom price is set", () => {
    expect(monthlyRate(home(), "2026-12")).toBe(1000);
  });
  it("custom price overrides only its own month", () => {
    const h = home({ monthlyPrices: { "2026-12": 1500 } });
    expect(monthlyRate(h, "2026-12")).toBe(1500);
    expect(monthlyRate(h, "2026-11")).toBe(1000);
    expect(monthlyRate(h, "2027-01")).toBe(1000);
  });
  it("is year-specific", () => {
    const h = home({ monthlyPrices: { "2026-12": 1500, "2027-12": 1800 } });
    expect(monthlyRate(h, "2026-12")).toBe(1500);
    expect(monthlyRate(h, "2027-12")).toBe(1800);
    expect(monthlyRate(h, "2028-12")).toBe(1000);
  });
  it("ignores invalid stored custom prices and falls back to base", () => {
    const h = home({ monthlyPrices: { "2026-12": -5, "2027-01": Number.NaN } as Record<string, number> });
    expect(monthlyRate(h, "2026-12")).toBe(1000);
    expect(monthlyRate(h, "2027-01")).toBe(1000);
  });
});

describe("quoteStay — base price only (backward compatible)", () => {
  it("a full calendar month costs exactly the monthly price", () => {
    const q = quoteStay(home(), "2027-01-01", "2027-02-01");
    expect(q.nights).toBe(31);
    expect(q.rentCents).toBe(100_000);
  });
  it("a 30-night stay inside a 31-day month is 30/31 of the price", () => {
    const q = quoteStay(home(), "2027-01-01", "2027-01-31");
    expect(q.rentCents).toBe(Math.round((100_000 * 30) / 31)); // 96774
    expect(q.rentCents).toBe(96_774);
  });
  it("works for listings that have no monthlyPrices field at all", () => {
    const q = quoteStay({ price: 3000, cleaningFee: 200 }, "2026-11-01", "2026-12-01");
    expect(q.segments).toHaveLength(1);
    expect(q.totalCents).toBe(320_000);
  });
});

describe("quoteStay — partial months and custom pricing", () => {
  it("matches the spec example: 15 Nov nights at base + 15 Dec nights at the December price", () => {
    const q = quoteStay(home({ monthlyPrices: { "2026-12": 1500 } }), "2026-11-16", "2026-12-16");
    expect(q.nights).toBe(30);
    expect(q.segments).toEqual([
      expect.objectContaining({ month: "2026-11", nights: 15, daysInMonth: 30, monthlyRateCents: 100_000, custom: false, amountCents: 50_000 }),
      expect.objectContaining({ month: "2026-12", nights: 15, daysInMonth: 31, monthlyRateCents: 150_000, custom: true, amountCents: 72_581 }),
    ]);
    expect(q.rentCents).toBe(122_581); // $500.00 + $725.81
  });

  it("multi-month stay across a year boundary with different rates per month", () => {
    const h = home({ price: 2000, cleaningFee: 150, monthlyPrices: { "2026-12": 3100, "2027-02": 2800 } });
    const q = quoteStay(h, "2026-11-20", "2027-03-10");
    expect(q.segments.map((s) => [s.month, s.nights])).toEqual([
      ["2026-11", 11],
      ["2026-12", 31],
      ["2027-01", 31],
      ["2027-02", 28],
      ["2027-03", 9],
    ]);
    expect(q.nights).toBe(110);
    const expected = [
      Math.round((200_000 * 11) / 30), // 73333
      310_000, // full December at custom price
      200_000, // full January at base
      280_000, // full February at custom price
      Math.round((200_000 * 9) / 31), // 58065
    ];
    expect(q.segments.map((s) => s.amountCents)).toEqual(expected);
    expect(q.rentCents).toBe(expected.reduce((a, b) => a + b, 0));
    expect(q.cleaningFeeCents).toBe(15_000);
    expect(q.totalCents).toBe(q.rentCents + 15_000);
  });

  it("handles leap-year February", () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2027, 2)).toBe(28);
    const leap = quoteStay(home({ monthlyPrices: { "2028-02": 2900 } }), "2028-02-01", "2028-03-01");
    expect(leap.nights).toBe(29);
    expect(leap.rentCents).toBe(290_000);
  });

  it("rounds each month to the cent and the breakdown always sums to the total", () => {
    const q = quoteStay(home({ price: 1234.57, cleaningFee: 99.99 }), "2026-10-17", "2027-01-03");
    for (const s of q.segments) expect(Number.isInteger(s.amountCents)).toBe(true);
    expect(q.segments.reduce((a, s) => a + s.amountCents, 0)).toBe(q.rentCents);
    expect(q.totalCents).toBe(q.rentCents + 9_999);
  });

  it("rounds half up (1 night of $1,000 in a 31-day month = $32.26)", () => {
    const q = quoteStay(home(), "2027-01-05", "2027-01-06");
    expect(q.rentCents).toBe(3_226);
  });

  it("checkout on the 1st does not charge a night in the new month", () => {
    const q = quoteStay(home({ monthlyPrices: { "2026-12": 9999 } }), "2026-10-15", "2026-12-01");
    expect(q.segments.map((s) => s.month)).toEqual(["2026-10", "2026-11"]);
  });
});

describe("quoteStay — invalid input", () => {
  it.each([
    ["2026-02-30", "2026-03-30"],
    ["2026-13-01", "2027-01-01"],
    ["not-a-date", "2026-12-01"],
    ["2026-12-01", "2026-12-01"],
    ["2026-12-10", "2026-12-01"],
  ])("rejects %s → %s", (a, b) => {
    expect(() => quoteStay(home(), a, b)).toThrow(PricingError);
  });
  it("rejects a home without a valid price", () => {
    expect(() => quoteStay({ price: 0, cleaningFee: 0 }, "2026-11-01", "2026-12-01")).toThrow(PricingError);
  });
  it("rejects absurdly long stays", () => {
    expect(() => quoteStay(home(), "2026-01-01", "2036-01-01")).toThrow(PricingError);
  });
});

describe("sanitizeMonthlyPrices", () => {
  it("accepts valid input and sorts it", () => {
    expect(sanitizeMonthlyPrices({ "2027-12": 1800, "2026-12": 1500 })).toEqual({ "2026-12": 1500, "2027-12": 1800 });
  });
  it("treats missing as empty", () => {
    expect(sanitizeMonthlyPrices(undefined)).toEqual({});
  });
  it.each([
    [{ "2026-13": 100 }],
    [{ "Dec 2026": 100 }],
    [{ "2026-12": 0 }],
    [{ "2026-12": -1 }],
    [{ "2026-12": "1500" }],
    [[1500]],
    ["1500"],
  ])("rejects %j", (v) => {
    expect(sanitizeMonthlyPrices(v)).toBeNull();
  });
});

describe("helpers", () => {
  it("isISODate is strict", () => {
    expect(isISODate("2028-02-29")).toBe(true);
    expect(isISODate("2027-02-29")).toBe(false);
    expect(isISODate("2027-2-1")).toBe(false);
  });
  it("fmtCents", () => {
    expect(fmtCents(122_581)).toBe("$1,225.81");
    expect(fmtCents(100_000)).toBe("$1,000");
    expect(fmtCents(3_210)).toBe("$32.10");
  });
});
