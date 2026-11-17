import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Booking, Listing } from "@/lib/admin/types";

// The booking API with a fake database. Listing rows here are the "trusted" prices.
const db = vi.hoisted(() => ({ listings: [] as unknown[], inserted: [] as { table: string; data: unknown }[], policies: [] as unknown[] }));

vi.mock("@/lib/db", () => {
  const sql = Object.assign(
    async (strings: TemplateStringsArray) => {
      const text = strings.join("?");
      if (/select data from listings/.test(text)) return db.listings.map((data) => ({ data }));
      if (/select id from listings/.test(text)) return [];
      if (/from bookings/.test(text)) return []; // no confirmed stays → no overlaps
      return [];
    },
    {
      query: async (text: string, params: unknown[]) => {
        const m = /insert into (\w+)/.exec(text);
        if (m) db.inserted.push({ table: m[1], data: JSON.parse(params[1] as string) });
        return [];
      },
    },
  );
  return { dbEnabled: true, sql, TABLES: [], isTable: () => true };
});
vi.mock("@/lib/settings", () => ({
  fetchSettings: async () => ({ minStayDays: 30, bookingsOpen: true, notifyBookings: false, notifyInquiries: false, notifyHosts: false, supportEmail: "", siteName: "Nestly", phone: "", cancellationPolicies: db.policies }),
}));
vi.mock("@/lib/notifications", () => ({ notifySubmission: vi.fn() }));
vi.mock("next/server", async (orig) => ({ ...(await orig<typeof import("next/server")>()), after: vi.fn() }));

const { POST } = await import("@/app/api/inquiry/route");

const listing = (over: Partial<Listing> = {}): Listing =>
  ({
    id: "test-home", slug: "test-home", title: "Test home", neighborhood: "Chelsea", borough: "Manhattan",
    beds: 1, baths: 1, sqft: 600, price: 1000, availableFrom: "2026-01-01", status: "published", featured: false,
    childrenAllowed: true, images: ["/x.jpg"], description: "", amenities: [], updatedAt: "2026-01-01T00:00:00Z",
    cleaningFee: 200, securityDeposit: 1000, utilitiesIncluded: true, maxGuests: 2, minGuestAge: 18,
    smokingAllowed: false, partiesAllowed: false, checkInTime: "3:00 PM", checkOutTime: "11:00 AM",
    cancellation: "moderate", specialInstructions: "",
    ...over,
  }) as Listing;

const request = (body: Record<string, unknown>) =>
  POST(new Request("http://localhost/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }));

const booking = (over: Record<string, unknown> = {}) => ({
  type: "booking", firstName: "Ana", lastName: "Lee", email: "ana@example.com",
  apartment: "test-home", movein: "2026-11-16", moveout: "2026-12-16", adults: "1", children: "0",
  ...over,
});

const storedBooking = () => db.inserted.find((r) => r.table === "bookings")?.data as Booking | undefined;

beforeEach(() => {
  db.listings = [listing({ monthlyPrices: { "2026-12": 1500 } })];
  db.inserted = [];
  db.policies = [];
});

describe("booking API pricing", () => {
  it("prices the stay from the stored listing and saves the quote", async () => {
    const res = await request(booking());
    expect(res.status).toBe(200);
    const json = await res.json();
    // 15 Nov nights at $1,000 + 15 Dec nights at $1,500 + $200 cleaning
    expect(json.quote.totalCents).toBe(50_000 + 72_581 + 20_000);
    const b = storedBooking()!;
    expect(b.quote?.totalCents).toBe(142_581);
    expect(b.quote?.segments.map((s) => s.month)).toEqual(["2026-11", "2026-12"]);
  });

  it("ignores every client-submitted price, total and quote field", async () => {
    const res = await request(
      booking({
        price: 1, total: 1, totalCents: 1, amount: 1, rent: 1, cleaningFee: 0,
        monthlyPrices: { "2026-11": 1, "2026-12": 1 },
        quote: { totalCents: 1, rentCents: 1, segments: [] },
      }),
    );
    expect(res.status).toBe(200);
    const b = storedBooking()!;
    expect(b.quote?.totalCents).toBe(142_581);
    expect(b.quote?.cleaningFeeCents).toBe(20_000);
    const raw = b as unknown as Record<string, unknown>;
    for (const k of ["price", "total", "totalCents", "amount", "rent", "monthlyPrices"]) expect(raw[k]).toBeUndefined();
  });

  it("uses the latest stored price, not one the page was rendered with", async () => {
    db.listings = [listing({ price: 4000, monthlyPrices: undefined })];
    const res = await request(booking({ movein: "2027-01-01", moveout: "2027-02-01", price: 1000 }));
    expect((await res.json()).quote.totalCents).toBe(400_000 + 20_000);
  });

  it("works for homes with only a base price", async () => {
    db.listings = [listing({ monthlyPrices: undefined })];
    const res = await request(booking());
    expect(res.status).toBe(200);
    // 15/30 of $1,000 + 15/31 of $1,000 = $500.00 + $483.87
    expect(storedBooking()!.quote!.rentCents).toBe(50_000 + 48_387);
  });

  it("rejects a booking with no home (it could not be priced)", async () => {
    const res = await request(booking({ apartment: undefined }));
    expect(res.status).toBe(422);
    expect(storedBooking()).toBeUndefined();
  });

  it("rejects unknown or unpublished homes", async () => {
    expect((await request(booking({ apartment: "no-such-home" }))).status).toBe(422);
    db.listings = [listing({ status: "draft" })];
    expect((await request(booking())).status).toBe(422);
    expect(storedBooking()).toBeUndefined();
  });

  it("rejects non-string apartment values (type confusion)", async () => {
    const res = await request(booking({ apartment: { $ne: "" } }));
    expect(res.status).toBe(422);
  });

  it("keeps the 30-night minimum", async () => {
    const res = await request(booking({ movein: "2026-11-16", moveout: "2026-12-15" }));
    expect(res.status).toBe(422);
    expect(storedBooking()).toBeUndefined();
  });

  it("rejects impossible calendar dates", async () => {
    const res = await request(booking({ movein: "2026-02-30", moveout: "2026-04-15" }));
    expect(res.status).toBe(422);
  });
});

describe("booking API cancellation policy", () => {
  const holiday = { id: "cp_holiday1", name: "Holiday season", summary: "Non-refundable for December move-ins.", details: "Full terms." };

  it("stores the home's standard policy on the booking", async () => {
    await request(booking());
    expect(storedBooking()!.cancellationPolicy).toMatchObject({ id: "moderate", name: "Moderate", standard: true });
  });

  it("stores a special policy with its full wording", async () => {
    db.policies = [holiday];
    db.listings = [listing({ cancellation: "cp_holiday1" })];
    await request(booking());
    expect(storedBooking()!.cancellationPolicy).toEqual({ ...holiday, standard: false });
  });

  it("falls back to the default if the home's special policy was deleted", async () => {
    db.listings = [listing({ cancellation: "cp_deleted1" })];
    const res = await request(booking());
    expect(res.status).toBe(200);
    expect(storedBooking()!.cancellationPolicy?.id).toBe("moderate");
  });

  it("ignores a policy sent by the browser", async () => {
    db.listings = [listing({ cancellation: "strict" })];
    await request(booking({ cancellation: "flexible", cancellationPolicy: { id: "flexible", name: "Free", summary: "Always refundable" } }));
    expect(storedBooking()!.cancellationPolicy).toMatchObject({ id: "strict", name: "Strict" });
  });
});
