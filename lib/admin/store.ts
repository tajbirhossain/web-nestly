"use client";

import { useSyncExternalStore } from "react";
import { defaultTerms } from "@/lib/data";
import { seedDB } from "./seed";
import type { CollectionKey, DB, Settings } from "./types";

// Client-side stand-in for a database: seeded from sample data and persisted
// to localStorage so edits survive reloads. Replace the bodies of `commit` and
// the actions below with API/DB calls when a backend is added; pages only talk
// to `useDB()` and `actions`.
const KEY = "nestly:admin:db:v1";
const AUTH_KEY = "nestly:admin:session";

let db: DB = seedDB;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) db = migrate({ ...seedDB, ...JSON.parse(raw) });
  } catch {
    /* corrupted or unavailable storage — fall back to seed data */
  }
}

/** Fills in fields added after data was first saved in this browser. */
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
  try {
    window.localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* storage unavailable — edits last for this session only */
  }
  listeners.forEach((l) => l());
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

type Item<K extends CollectionKey> = DB[K][number];
type WithId = { id: string };

export const actions = {
  upsert<K extends CollectionKey>(key: K, item: Item<K>) {
    load();
    const list = db[key] as WithId[];
    const exists = list.some((x) => x.id === (item as WithId).id);
    const next = exists ? list.map((x) => (x.id === (item as WithId).id ? item : x)) : [item as WithId, ...list];
    commit({ ...db, [key]: next });
  },
  patch<K extends CollectionKey>(key: K, id: string, changes: Partial<Item<K>>) {
    load();
    const list = db[key] as WithId[];
    commit({ ...db, [key]: list.map((x) => (x.id === id ? { ...x, ...changes } : x)) });
  },
  remove(key: CollectionKey, id: string) {
    load();
    commit({ ...db, [key]: (db[key] as WithId[]).filter((x) => x.id !== id) });
  },
  saveSettings(settings: Settings) {
    load();
    commit({ ...db, settings });
  },
  reset() {
    commit(seedDB);
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
