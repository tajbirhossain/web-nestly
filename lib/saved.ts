"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "nestly:saved";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

/** Saved ("hearted") apartment slugs, persisted in localStorage when available. */
export function useSaved() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const saved: string[] = JSON.parse(raw);

  const toggle = useCallback((slug: string) => {
    const cur: string[] = JSON.parse(read());
    const next = cur.includes(slug) ? cur.filter((s) => s !== slug) : [...cur, slug];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — keep UI responsive but unsaved */
    }
    listeners.forEach((l) => l());
  }, []);

  return { saved, toggle };
}
