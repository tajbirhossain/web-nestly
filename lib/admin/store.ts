"use client";

import { useSyncExternalStore } from "react";
import { defaultTerms } from "@/lib/data";
import { clearAll, deleteRow, loadRemote, notifyStatus, saveRows, saveSettingsRow, writeAll } from "./remote";
import { seedDB } from "./seed";
import type { CollectionKey, DB, Settings } from "./types";

// Admin data layer. When the server has DATABASE_URL (Neon), every read/write goes
// through /api/admin/db (see lib/admin/remote.ts) and an empty database is seeded
// automatically. Without it, seed data is persisted in localStorage instead. Pages only talk to
// `useDB()` and `actions`, so swapping in MySQL later only touches this file.
const KEY = "nestly:admin:db:v1";
const AUTH_KEY = "nestly:admin:session";

export type DBStatus = { remote: boolean; ready: boolean; error: string | null };
const SERVER_STATUS: DBStatus = { remote: false, ready: false, error: null };

let db: DB = seedDB;
let status: DBStatus = SERVER_STATUS;
let loaded = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function setStatus(patch: Partial<DBStatus>) {
  status = { ...status, ...patch };
  notify();
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  void hydrate(true);
  // Pick up bookings/inquiries submitted on the public site when the tab regains focus.
  window.addEventListener("focus", () => status.remote && void hydrate(false));
}

function loadLocal() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) db = migrate({ ...seedDB, ...JSON.parse(raw) });
  } catch {
    /* corrupted or unavailable storage — fall back to seed data */
  }
}

async function hydrate(first: boolean) {
  try {
    const res = await loadRemote();
    if (!res.enabled) {
      loadLocal();
      setStatus({ remote: false, ready: true, error: null });
      return;
    }
    if (res.data) {
      db = migrate({ ...seedDB, ...res.data });
    } else if (first) {
      db = seedDB; // fresh database: load the demo data into it
      await writeAll(seedDB);
    }
    setStatus({ remote: true, ready: true, error: null });
  } catch (e) {
    setStatus({ ready: true, error: e instanceof Error ? e.message : "Could not reach the database" });
  }
}

/** Fills in fields added after data was first saved. */
function migrate(d: DB): DB {
  return {
    ...d,
    listings: d.listings.map((l) => ({ ...defaultTerms(l), ...l, childrenAllowed: l.childrenAllowed ?? true })),
    bookings: d.bookings.map((b) => {
      const old = b as typeof b & { guests?: number };
      return { ...b, adults: b.adults ?? old.guests ?? 1, children: b.children ?? 0 };
    }),
  };
}

function commit(next: DB) {
  db = next;
  if (!status.remote) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* storage unavailable — edits last for this session only */
    }
  }
  notify();
}

/** Writes are optimistic: the UI updates first, the database catches up, failures surface in the status banner. */
function persist(job: () => Promise<unknown>) {
  if (!status.remote) return;
  job()
    .then(() => status.error && setStatus({ error: null }))
    .catch((e) => setStatus({ error: e instanceof Error ? e.message : "Could not save to the database" }));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useDB(): DB {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return db;
    },
    () => seedDB,
  );
}

export function useDBStatus(): DBStatus {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return status;
    },
    () => SERVER_STATUS,
  );
}

type Item<K extends CollectionKey> = DB[K][number];
type WithId = { id: string };

export const actions = {
  upsert<K extends CollectionKey>(key: K, item: Item<K>) {
    load();
    const list = db[key] as WithId[];
    const exists = list.some((x) => x.id === (item as WithId).id);
    const next = exists ? list.map((x) => (x.id === (item as WithId).id ? item : x)) : [item as WithId, ...list];
    commit({ ...db, [key]: next });
    persist(() => saveRows(key, [item as WithId]));
  },
  patch<K extends CollectionKey>(key: K, id: string, changes: Partial<Item<K>>) {
    load();
    const list = db[key] as WithId[];
    const merged = list.map((x) => (x.id === id ? { ...x, ...changes } : x));
    commit({ ...db, [key]: merged });
    const row = merged.find((x) => x.id === id);
    if (row) persist(() => saveRows(key, [row]).then(() => notifyStatus(key, id, changes as { status?: string })));
  },
  remove(key: CollectionKey, id: string) {
    load();
    commit({ ...db, [key]: (db[key] as WithId[]).filter((x) => x.id !== id) });
    persist(() => deleteRow(key, id));
  },
  saveSettings(settings: Settings) {
    load();
    commit({ ...db, settings });
    persist(() => saveSettingsRow(settings));
  },
  reset() {
    commit(seedDB);
    persist(async () => {
      await clearAll();
      await writeAll(seedDB);
    });
  },
};

// ---- demo auth (no backend yet): a flag in localStorage -------------------
export const DEMO_LOGIN = { email: "admin@nestly.nyc", password: "nestly-admin" };
const authListeners = new Set<() => void>();

export function signIn(email: string, password: string) {
  if (email.trim().toLowerCase() !== DEMO_LOGIN.email || password !== DEMO_LOGIN.password) return false;
  try {
    window.localStorage.setItem(AUTH_KEY, "1");
  } catch {
    /* ignore */
  }
  authListeners.forEach((l) => l());
  return true;
}

export function signOut() {
  try {
    window.localStorage.removeItem(AUTH_KEY);
  } catch {
    /* ignore */
  }
  authListeners.forEach((l) => l());
}

/** undefined = not known yet (server / first paint), boolean afterwards. */
export function useSession(): boolean | undefined {
  return useSyncExternalStore(
    (cb) => {
      authListeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        authListeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => {
      try {
        return window.localStorage.getItem(AUTH_KEY) === "1";
      } catch {
        return false;
      }
    },
    () => undefined,
  );
}
