import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Admin endpoints: they can rewrite listing prices and bookings, so they must require
// a valid server session, validate prices, and never let a client set a booking quote.
const db = vi.hoisted(() => ({ queries: [] as { text: string; params?: unknown[] }[] }));

vi.mock("@/lib/db", () => {
  const TABLES = ["listings", "bookings", "inquiries", "hosts", "reviews", "posts", "settings"];
  const sql = Object.assign(async () => [], {
    query: async (text: string, params?: unknown[]) => {
      db.queries.push({ text, params });
      return [];
    },
  });
  return { dbEnabled: true, sql, TABLES, isTable: (t: unknown) => TABLES.includes(t as string) };
});
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const dbRoute = await import("@/app/api/admin/db/route");
const sessionRoute = await import("@/app/api/admin/session/route");
const notifyRoute = await import("@/app/api/admin/notify/route");
const uploadRoute = await import("@/app/api/admin/upload/route");
const auth = await import("@/lib/adminAuth");

const json = (url: string, body: unknown, cookie?: string) =>
  new Request(url, { method: "POST", headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });

async function login(email = "admin@nestly.nyc", password = "nestly-admin") {
  const res = await sessionRoute.POST(json("http://localhost/api/admin/session", { email, password }));
  const set = res.headers.get("set-cookie") ?? "";
  return { res, cookie: set.split(";")[0] };
}

const priceAttack = { op: "save", table: "listings", items: [{ id: "home", slug: "home", price: 1, cleaningFee: 0 }] };

beforeEach(() => {
  db.queries = [];
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("unauthenticated access is refused", () => {
  it("cannot change a listing price", async () => {
    const res = await dbRoute.POST(json("http://localhost/api/admin/db", priceAttack));
    expect(res.status).toBe(401);
    expect(db.queries).toHaveLength(0);
  });
  it("cannot read the database (guest PII)", async () => {
    const res = await dbRoute.GET(new Request("http://localhost/api/admin/db"));
    expect(res.status).toBe(401);
  });
  it("cannot wipe the database", async () => {
    const res = await dbRoute.POST(json("http://localhost/api/admin/db", { op: "clear" }));
    expect(res.status).toBe(401);
    expect(db.queries).toHaveLength(0);
  });
  it("cannot trigger guest emails or upload files", async () => {
    expect((await notifyRoute.POST(json("http://localhost/api/admin/notify", { kind: "booking", id: "bk_1", status: "confirmed" }))).status).toBe(401);
    expect((await uploadRoute.POST(new Request("http://localhost/api/admin/upload", { method: "POST" }))).status).toBe(401);
  });
  it("rejects forged, tampered and expired session cookies", async () => {
    const valid = auth.createSessionToken();
    const [exp, mac] = valid.split(".");
    const forged = [
      "1",
      `${Number(exp) + 999999}.${mac}`, // extended expiry, old signature
      `${exp}.${mac.slice(0, -2)}AA`,
      "localStorage-flag",
    ];
    for (const t of forged) {
      const res = await dbRoute.POST(json("http://localhost/api/admin/db", priceAttack, `${auth.ADMIN_COOKIE}=${t}`));
      expect(res.status).toBe(401);
    }
    const expired = auth.createSessionToken(Date.now() - (auth.SESSION_TTL_SECONDS + 60) * 1000);
    expect(auth.verifySessionToken(expired)).toBe(false);
    expect(db.queries).toHaveLength(0);
  });
});

describe("admin login", () => {
  it("rejects a wrong password", async () => {
    const { res, cookie } = await login("admin@nestly.nyc", "guess");
    expect(res.status).toBe(401);
    expect(cookie).toBe("");
  });
  it("issues an HttpOnly, SameSite=Strict cookie scoped to the admin API", async () => {
    const { res } = await login();
    expect(res.status).toBe(200);
    const set = res.headers.get("set-cookie") ?? "";
    expect(set).toMatch(/HttpOnly/i);
    expect(set).toMatch(/SameSite=Strict/i);
    expect(set).toMatch(/Path=\/api\/admin/i);
  });
  it("in production the public demo password does not work without ADMIN_PASSWORD", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "");
    const { res } = await login();
    expect(res.status).toBe(503);
  });
  it("in production only ADMIN_PASSWORD works", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ADMIN_PASSWORD", "s3cret-pass");
    expect((await login()).res.status).toBe(401);
    const ok = await login("admin@nestly.nyc", "s3cret-pass");
    expect(ok.res.status).toBe(200);
    expect((await dbRoute.POST(json("http://localhost/api/admin/db", { op: "delete", table: "posts", id: "x" }, ok.cookie))).status).toBe(200);
  });
});

describe("signed-in admin writes are validated", () => {
  it("allows a valid listing price save including custom months", async () => {
    const { cookie } = await login();
    const res = await dbRoute.POST(
      json("http://localhost/api/admin/db", { op: "save", table: "listings", items: [{ id: "home", price: 1000, cleaningFee: 200, monthlyPrices: { "2026-12": 1500 } }] }, cookie),
    );
    expect(res.status).toBe(200);
    expect(db.queries).toHaveLength(1);
  });

  it.each([
    [{ price: -100 }],
    [{ price: 0 }],
    [{ price: "1000" }],
    [{ price: 1000, cleaningFee: -50 }],
    [{ price: 1000, monthlyPrices: { "2026-12": 0 } }],
    [{ price: 1000, monthlyPrices: { "December": 1500 } }],
  ])("rejects bad listing pricing %j", async (fields) => {
    const { cookie } = await login();
    const res = await dbRoute.POST(json("http://localhost/api/admin/db", { op: "save", table: "listings", items: [{ id: "home", ...fields }] }, cookie));
    expect(res.status).toBe(422);
    expect(db.queries).toHaveLength(0);
  });

  it("booking saves strip any client quote and preserve the stored one", async () => {
    const { cookie } = await login();
    const res = await dbRoute.POST(
      json("http://localhost/api/admin/db", { op: "save", table: "bookings", items: [{ id: "bk_1", status: "confirmed", quote: { totalCents: 1 } }] }, cookie),
    );
    expect(res.status).toBe(200);
    const { text } = db.queries[0];
    // New rows: the client's quote is removed. Existing rows: the stored quote is written back.
    expect(text).toMatch(/\(e->'data'\) - 'quote'/);
    expect(text).toMatch(/jsonb_set\(excluded\.data, '\{quote\}', bookings\.data->'quote'\)/);
  });
});
