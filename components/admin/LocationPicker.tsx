"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef, useState } from "react";
import type { Map as LMap, Marker } from "leaflet";
import { Field } from "./ui";
import { Icon } from "./icons";

type Props = {
  address: string;
  lat: number | null;
  lng: number | null;
  /** Where to centre the map while no pin is set. */
  center: [number, number];
  /** Added to the address search so "123 Main St" resolves in the right state. */
  state: "NY" | "NJ";
  onAddress: (v: string) => void;
  onPoint: (lat: number | null, lng: number | null) => void;
};

const pinIcon = (L: typeof import("leaflet")) =>
  L.divIcon({ className: "nm-pin-wrap", html: '<span class="nm-pin is-active">●</span>', iconSize: [0, 0] });

/** Free OpenStreetMap geocoder (fine for demo volumes; swap for Google/Mapbox in production). */
async function geocode(q: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=us&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error("Address search is unavailable right now");
  const [hit] = (await res.json()) as { lat: string; lon: string }[];
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
}

export default function LocationPicker({ address, lat, lng, center, state, onAddress, onPoint }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const emit = useRef(onPoint);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ text: string; bad?: boolean } | null>(null);

  useEffect(() => {
    emit.current = onPoint;
  });

  // Create the map once; clicking it drops (or moves) the pin.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, { scrollWheelZoom: false }).setView(lat != null && lng != null ? [lat, lng] : center, lat != null ? 15 : 12);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(m);
      m.on("click", (e) => emit.current(round(e.latlng.lat), round(e.latlng.lng)));
      map.current = m;
      if (lat != null && lng != null) placeMarker(L, lat, lng);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function placeMarker(L: typeof import("leaflet"), la: number, ln: number) {
    if (marker.current) {
      marker.current.setLatLng([la, ln]);
      return;
    }
    marker.current = L.marker([la, ln], { icon: pinIcon(L), draggable: true, keyboard: false })
      .addTo(map.current!)
      .on("dragend", (e) => {
        const p = (e.target as Marker).getLatLng();
        emit.current(round(p.lat), round(p.lng));
      });
  }

  // Keep the pin in step with the form value (search result, click, or clear).
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    import("leaflet").then((L) => {
      if (!map.current) return;
      if (lat == null || lng == null) {
        marker.current?.remove();
        marker.current = null;
        m.setView(center, 12);
        return;
      }
      placeMarker(L, lat, lng);
      if (!m.getBounds().contains([lat, lng])) m.setView([lat, lng], Math.max(m.getZoom(), 15));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, center[0], center[1]]);

  async function find() {
    const q = address.trim();
    if (!q) return setNote({ text: "Type an address first", bad: true });
    setBusy(true);
    setNote(null);
    try {
      const withState = /\b(NY|NJ|New York|New Jersey)\b/i.test(q) ? q : `${q}, ${state}`;
      const hit = await geocode(withState);
      if (!hit) setNote({ text: "Couldn't find that address. Try adding the city, or click the map to place the pin.", bad: true });
      else {
        onPoint(round(hit.lat), round(hit.lng));
        map.current?.setView([hit.lat, hit.lng], 16);
        setNote({ text: "Pin placed. Drag it or click the map to fine-tune." });
      }
    } catch (e) {
      setNote({ text: e instanceof Error ? e.message : "Address search failed", bad: true });
    } finally {
      setBusy(false);
    }
  }

  const has = lat != null && lng != null;
  return (
    <div className="grid gap-3 sm:col-span-2">
      <Field label="Street address" hint="Shown on the listing page and cards. Use a street or cross street if you don't want to show the exact building.">
        {(id) => (
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              id={id}
              className="a-input"
              value={address}
              onChange={(e) => onAddress(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void find();
                }
              }}
              placeholder="e.g. 245 E 63rd St, New York, NY"
              autoComplete="street-address"
            />
            <button type="button" className="a-btn a-btn-outline shrink-0" onClick={() => void find()} disabled={busy}>
              <Icon name="search" size={16} /> {busy ? "Searching…" : "Find on map"}
            </button>
          </div>
        )}
      </Field>
      <div ref={el} className="h-64 overflow-hidden rounded-xl border border-line bg-soft sm:h-72" role="region" aria-label="Pick the apartment location on the map" />
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className={note?.bad ? "text-bad" : "text-muted"} role={note?.bad ? "alert" : undefined}>
          {note?.text ??
            (has ? `Pin at ${lat!.toFixed(5)}, ${lng!.toFixed(5)}. Drag it or click the map to move it.` : "No pin yet. Search an address or click the map. Until then the site shows an approximate spot for the area.")}
        </p>
        {has && (
          <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => onPoint(null, null)}>
            Clear pin
          </button>
        )}
      </div>
    </div>
  );
}

const round = (n: number) => Math.round(n * 1e6) / 1e6;
