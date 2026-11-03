import type { CollectionKey, DB, Settings } from "./types";

// Client side of the admin data layer: talks to /api/admin/db, which runs the SQL
// against Neon. Swap the route (and lib/db.ts) for MySQL later; nothing here changes.
const COLLECTIONS: CollectionKey[] = ["listings", "bookings", "inquiries", "hosts", "reviews", "posts"];
const SETTINGS_ID = "main";
type Table = CollectionKey | "settings";

async function call(init?: { body: unknown }) {
  const res = await fetch("/api/admin/db", {
    method: init ? "POST" : "GET",
    headers: init ? { "Content-Type": "application/json" } : undefined,
    body: init ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? `Request failed (${res.status})`);
  return json;
}

/** `enabled: false` means the server has no DATABASE_URL; `data: null` means every table is empty. */
export async function loadRemote(): Promise<{ enabled: false } | { enabled: true; data: Partial<DB> | null }> {
  const json = await call();
  if (!json.enabled) return { enabled: false };
  const t = json.data as Record<Table, unknown[]>;
  if ([...COLLECTIONS, "settings" as const].every((k) => t[k].length === 0)) return { enabled: true, data: null };
  const data: Partial<DB> = {};
  COLLECTIONS.forEach((k) => Object.assign(data, { [k]: t[k] }));
  if (t.settings[0]) data.settings = t.settings[0] as Settings;
  return { enabled: true, data };
}

export const saveRows = (table: Table, items: { id: string }[], ordered = false) =>
  items.length ? call({ body: { op: "save", table, items, ordered } }) : Promise.resolve();

export const saveSettingsRow = (s: Settings) => saveRows("settings", [{ ...s, id: SETTINGS_ID } as Settings & { id: string }]);

export const deleteRow = (table: Table, id: string) => call({ body: { op: "delete", table, id } });

/** Tells the server to email the guest or host after a status change (it re-checks the saved status itself). */
export async function notifyStatus(table: Table, id: string, changes: { status?: string }) {
  if (!changes.status || (table !== "bookings" && table !== "hosts")) return;
  await fetch("/api/admin/notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: table === "bookings" ? "booking" : "host", id, status: changes.status }),
  }).catch(() => {});
}

export const clearAll = () => call({ body: { op: "clear" } });

export async function writeAll(db: DB) {
  await Promise.all([...COLLECTIONS.map((k) => saveRows(k, db[k] as { id: string }[], true)), saveSettingsRow(db.settings)]);
}
