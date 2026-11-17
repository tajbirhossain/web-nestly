import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { TABLES, dbEnabled, isTable, sql } from "@/lib/db";
import { sanitizeMonthlyPrices } from "@/lib/pricing";

// Data endpoint for the admin panel. Every request needs a signed-in admin session
// (see lib/adminAuth.ts). Table names are checked against an allow-list before being
// put into SQL text.

// Public pages cache these tables; drop the cache entry so admin edits show up immediately.
const PUBLIC_TABLES = ["listings", "reviews", "settings", "bookings", "posts"];
const refreshSite = (table: string) => {
  if (PUBLIC_TABLES.includes(table)) revalidateTag(table, { expire: 0 });
};

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if (!dbEnabled) return NextResponse.json({ enabled: false });
  try {
    const rows = await Promise.all(TABLES.map((t) => sql.query(`select data from ${t} order by created_at desc`)));
    const data = Object.fromEntries(TABLES.map((t, i) => [t, rows[i].map((r) => r.data)]));
    return NextResponse.json({ enabled: true, data });
  } catch (e) {
    return fail(e);
  }
}

type Body =
  | { op: "save"; table: string; items: { id: string }[]; ordered?: boolean }
  | { op: "delete"; table: string; id: string }
  | { op: "clear" };

const money = (v: unknown, min = 0) => typeof v === "number" && Number.isFinite(v) && v >= min && v <= 1_000_000;

/** Pricing fields on a listing must be sane numbers; custom months must be "YYYY-MM" → positive price. */
function listingProblem(item: Record<string, unknown>): string | null {
  if (!money(item.price) || (item.price as number) <= 0) return "Listing price must be a positive number";
  if (item.cleaningFee !== undefined && !money(item.cleaningFee)) return "Cleaning fee must be 0 or more";
  if (item.securityDeposit !== undefined && !money(item.securityDeposit)) return "Security deposit must be 0 or more";
  if (sanitizeMonthlyPrices(item.monthlyPrices) === null) return "Custom monthly prices must use YYYY-MM months and positive prices";
  return null;
}

export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  if (!dbEnabled) return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 503 });
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    if (body.op === "save") {
      if (!isTable(body.table) || !Array.isArray(body.items) || !body.items.every((i) => i && typeof i.id === "string" && i.id)) {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
      }
      if (body.table === "listings") {
        for (const item of body.items) {
          const problem = listingProblem(item as Record<string, unknown>);
          if (problem) return NextResponse.json({ error: problem }, { status: 422 });
          const clean = sanitizeMonthlyPrices((item as { monthlyPrices?: unknown }).monthlyPrices)!;
          if (Object.keys(clean).length) Object.assign(item, { monthlyPrices: clean });
          else delete (item as { monthlyPrices?: unknown }).monthlyPrices;
        }
      }
      if (body.items.length) {
        // `ordered` stamps created_at so rows read back in array order (used when seeding).
        const base = Date.now();
        const payload = body.items.map((item, i) => ({
          id: item.id,
          data: item,
          created_at: body.ordered ? new Date(base - i * 1000).toISOString() : null,
        }));
        // A booking's `quote` is server-owned: written once by the booking API from stored
        // prices. Admin saves can never add, change or remove it, so the stored amount of
        // an existing booking can't be altered through this endpoint.
        const write =
          body.table === "bookings"
            ? `insert into bookings (id, data, created_at)
               select e->>'id', (e->'data') - 'quote', coalesce((e->>'created_at')::timestamptz, now())
               from jsonb_array_elements($1::jsonb) e
               on conflict (id) do update set data =
                 case when bookings.data ? 'quote'
                      then jsonb_set(excluded.data, '{quote}', bookings.data->'quote')
                      else excluded.data end`
            : `insert into ${body.table} (id, data, created_at)
               select e->>'id', e->'data', coalesce((e->>'created_at')::timestamptz, now())
               from jsonb_array_elements($1::jsonb) e
               on conflict (id) do update set data = excluded.data`;
        await sql.query(write, [JSON.stringify(payload)]);
      }
      refreshSite(body.table);
    } else if (body.op === "delete") {
      if (!isTable(body.table) || typeof body.id !== "string") return NextResponse.json({ error: "Bad request" }, { status: 400 });
      await sql.query(`delete from ${body.table} where id = $1`, [body.id]);
      refreshSite(body.table);
    } else if (body.op === "clear") {
      await Promise.all(TABLES.map((t) => sql.query(`delete from ${t}`)));
      PUBLIC_TABLES.forEach(refreshSite);
    } else {
      return NextResponse.json({ error: "Unknown operation" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return fail(e);
  }
}

function fail(e: unknown) {
  console.error("[admin/db]", e);
  return NextResponse.json({ error: e instanceof Error ? e.message : "Database error" }, { status: 500 });
}
