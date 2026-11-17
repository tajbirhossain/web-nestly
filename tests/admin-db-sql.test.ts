import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Runs the admin save endpoint against a real (in-process) Postgres with the project's
// schema, to prove a stored booking quote can't be changed, added or removed by the client.
const pg = vi.hoisted(() => ({ db: null as unknown as import("@electric-sql/pglite").PGlite }));

vi.mock("@/lib/db", () => {
  const TABLES = ["listings", "bookings", "inquiries", "hosts", "reviews", "posts", "settings"];
  const sql = Object.assign(async () => [], {
    query: async (text: string, params?: unknown[]) => (await pg.db.query(text, params)).rows,
  });
  return { dbEnabled: true, sql, TABLES, isTable: (t: unknown) => TABLES.includes(t as string) };
});
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const { POST } = await import("@/app/api/admin/db/route");
const { createSessionToken, ADMIN_COOKIE } = await import("@/lib/adminAuth");

const save = (items: unknown[]) =>
  POST(
    new Request("http://localhost/api/admin/db", {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie: `${ADMIN_COOKIE}=${createSessionToken()}` },
      body: JSON.stringify({ op: "save", table: "bookings", items }),
    }),
  );

const read = async (id: string) =>
  ((await pg.db.query<{ data: Record<string, unknown> }>("select data from bookings where id = $1", [id])).rows[0]?.data);

const serverQuote = { currency: "USD", nights: 30, rentCents: 122_581, cleaningFeeCents: 20_000, totalCents: 142_581, segments: [] };

beforeAll(async () => {
  pg.db = new PGlite();
  await pg.db.exec(readFileSync("db/schema.sql", "utf8"));
});
beforeEach(async () => {
  await pg.db.exec("delete from bookings");
  // A booking created by the booking API, with its server-computed quote.
  await pg.db.query("insert into bookings (id, data) values ($1, $2::jsonb)", [
    "bk_server",
    JSON.stringify({ id: "bk_server", status: "new", notes: "", quote: serverQuote }),
  ]);
});

describe("admin booking saves vs. stored quotes (real Postgres)", () => {
  it("status/notes updates keep the stored quote even if the client sends a different one", async () => {
    const res = await save([{ id: "bk_server", status: "confirmed", notes: "ok", quote: { ...serverQuote, totalCents: 1 } }]);
    expect(res.status).toBe(200);
    const row = await read("bk_server");
    expect(row.status).toBe("confirmed");
    expect(row.notes).toBe("ok");
    expect(row.quote).toEqual(serverQuote);
  });

  it("a client can't remove the stored quote by omitting it", async () => {
    await save([{ id: "bk_server", status: "contacted" }]);
    expect((await read("bk_server")).quote).toEqual(serverQuote);
  });

  it("a client can't attach a quote to a new or legacy booking", async () => {
    await pg.db.query("insert into bookings (id, data) values ('bk_legacy', '{\"id\":\"bk_legacy\",\"status\":\"new\"}'::jsonb)");
    await save([
      { id: "bk_legacy", status: "confirmed", quote: { totalCents: 1 } },
      { id: "bk_new", status: "new", quote: { totalCents: 1 } },
    ]);
    const legacy = await read("bk_legacy");
    expect(legacy.status).toBe("confirmed");
    expect(legacy.quote).toBeUndefined();
    expect((await read("bk_new")).quote).toBeUndefined();
  });
});
