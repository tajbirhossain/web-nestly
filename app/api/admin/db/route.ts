import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { TABLES, dbEnabled, isTable, sql } from "@/lib/db";

// Demo-only data endpoint for the admin panel: no auth, so don't expose this publicly.
// Table names are checked against an allow-list before being put into SQL text.

// Public pages cache these tables; drop the cache entry so admin edits show up immediately.
const PUBLIC_TABLES = ["listings", "reviews", "settings", "bookings", "posts"];
const refreshSite = (table: string) => {
  if (PUBLIC_TABLES.includes(table)) revalidateTag(table, { expire: 0 });
};

export async function GET() {
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

export async function POST(req: Request) {
  if (!dbEnabled) return NextResponse.json({ error: "DATABASE_URL is not set" }, { status: 503 });
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    if (body.op === "save") {
      if (!isTable(body.table) || !Array.isArray(body.items)) return NextResponse.json({ error: "Bad request" }, { status: 400 });
      if (body.items.length) {
        // `ordered` stamps created_at so rows read back in array order (used when seeding).
        const base = Date.now();
        const payload = body.items.map((item, i) => ({
          id: item.id,
          data: item,
          created_at: body.ordered ? new Date(base - i * 1000).toISOString() : null,
        }));
        await sql.query(
          `insert into ${body.table} (id, data, created_at)
           select e->>'id', e->'data', coalesce((e->>'created_at')::timestamptz, now())
           from jsonb_array_elements($1::jsonb) e
           on conflict (id) do update set data = excluded.data`,
          [JSON.stringify(payload)],
        );
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
