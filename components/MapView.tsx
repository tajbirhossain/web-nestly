"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LMap, Marker } from "leaflet";

export type Pin = { slug: string; title: string; price: number; lat: number; lng: number; image?: string };

const fmtPrice = (n: number) => (n >= 10000 ? `$${Math.round(n / 1000)}k` : `$${n.toLocaleString("en-US")}`);

export default function MapView({
  pins,
  activeSlug,
  onSelect,
  className = "",
  zoom,
  interactive = true,
}: {
  pins: Pin[];
  activeSlug?: string | null;
  onSelect?: (slug: string) => void;
  className?: string;
  /** Fixed zoom for single-pin maps; otherwise the map fits all pins. */
  zoom?: number;
  interactive?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LMap | null>(null);
  const markers = useRef<Map<string, Marker>>(new Map());
  const select = useRef(onSelect);

  useEffect(() => {
    select.current = onSelect;
  });

  // Create the map once.
  useEffect(() => {
    let cancelled = false;
    const pinMap = markers.current;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el.current || map.current) return;
      map.current = L.map(el.current, {
        zoomControl: false,
        scrollWheelZoom: interactive,
        dragging: interactive,
        doubleClickZoom: interactive,
        attributionControl: true,
      }).setView([40.7484, -73.9857], 12);
      L.control.zoom({ position: "topright" }).addTo(map.current);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);
      // Mute the tiles so the price pins stand out.
      map.current.getPane("tilePane")!.style.filter = "grayscale(0.75) contrast(0.92) brightness(1.04)";
      draw(L);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      pinMap.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw(L: typeof import("leaflet")) {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current.clear();
    pins.forEach((p) => {
      const icon = L.divIcon({
        className: "nm-pin-wrap",
        html: `<span class="nm-pin">${interactive ? fmtPrice(p.price) : "●"}</span>`,
        iconSize: [0, 0],
      });
      const mk = L.marker([p.lat, p.lng], { icon, keyboard: true, title: p.title }).addTo(m);
      if (interactive) {
        mk.on("click", () => select.current?.(p.slug));
        mk.bindTooltip(p.title, { direction: "top", offset: [0, -14], className: "nm-tip" });
      }
      markers.current.set(p.slug, mk);
    });
    if (pins.length === 1 && zoom) m.setView([pins[0].lat, pins[0].lng], zoom);
    else if (pins.length) m.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])), { padding: [60, 60], maxZoom: 14 });
  }

  // Redraw when the pin set changes.
  const sig = pins.map((p) => p.slug).join("|");
  useEffect(() => {
    if (!map.current) return;
    import("leaflet").then((L) => draw(L));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  // Highlight the active pin.
  useEffect(() => {
    markers.current.forEach((mk, slug) => {
      const node = mk.getElement()?.querySelector(".nm-pin");
      node?.classList.toggle("is-active", slug === activeSlug);
      mk.setZIndexOffset(slug === activeSlug ? 1000 : 0);
    });
  }, [activeSlug, sig]);

  return <div ref={el} className={`nm-map bg-soft ${className}`} role="region" aria-label="Map of apartments" />;
}
