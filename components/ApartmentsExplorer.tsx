"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import ApartmentCard from "@/components/ApartmentCard";
import FiltersModal, { emptyFilters, type FilterState } from "@/components/FiltersModal";
import MapView from "@/components/MapView";
import Select from "@/components/ui/Select";
import { DatesPicker, GuestsPicker, guestTotal, noGuests, type Guests } from "@/components/ui/Pickers";
import { HeartIcon } from "@/components/ui/icons";
import { PRICE_MAX, PRICE_MIN, allowsChildren, apartments, areaOptions, capacity } from "@/lib/data";
import { useSaved } from "@/lib/saved";

const sortOptions = [
  { value: "featured", label: "Recommended" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "soon", label: "Available soonest" },
];

export default function ApartmentsExplorer({ children }: { children?: ReactNode }) {
  const sp = useSearchParams();
  const { saved } = useSaved();
  const [area, setArea] = useState(sp.get("area") ?? "");
  const [guests, setGuests] = useState<Guests>(() => {
    const children = Number(sp.get("children") ?? 0) || 0;
    // `guests` is the legacy total-only param; treat it as adults.
    const adults = Number(sp.get("adults") ?? sp.get("guests") ?? 0) || 0;
    return children && !adults ? { adults: 1, children } : { adults, children };
  });
  const partySize = guestTotal(guests);
  const [start, setStart] = useState(sp.get("movein") ?? "");
  const [end, setEnd] = useState(sp.get("moveout") ?? "");
  const [filters, setFilters] = useState<FilterState>({ ...emptyFilters, beds: sp.get("beds") ?? "" });
  const [sort, setSort] = useState("featured");
  const [onlySaved, setOnlySaved] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [mobileMap, setMobileMap] = useState(false);

  const results = useMemo(() => {
    const { beds, baths, price, features } = filters;
    const list = apartments.filter(
      (a) =>
        (!area || a.borough === area || a.neighborhood === area) &&
        (!beds || (beds === "3" ? a.beds >= 3 : a.beds === Number(beds))) &&
        (!baths || (baths === "3" ? a.baths >= 3 : a.baths === Number(baths))) &&
        (!partySize || capacity(a) >= partySize) &&
        (!guests.children || allowsChildren(a)) &&
        a.price >= price[0] &&
        a.price <= price[1] &&
        features.every((f) => a.amenities.includes(f)) &&
        (!onlySaved || saved.includes(a.slug)),
    );
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    if (sort === "high") list.sort((a, b) => b.price - a.price);
    if (sort === "soon") list.sort((a, b) => a.availableFrom.localeCompare(b.availableFrom));
    if (sort === "featured") list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return list;
  }, [area, guests, partySize, filters, sort, onlySaved, saved]);

  const priceActive = filters.price[0] > PRICE_MIN || filters.price[1] < PRICE_MAX;
  const filterCount = [filters.beds, filters.baths].filter(Boolean).length + filters.features.length + (priceActive ? 1 : 0);
  const dirty = area || partySize || start || filterCount || onlySaved;
  const pins = results.map((a) => ({ slug: a.slug, title: a.title, price: a.price, lat: a.lat, lng: a.lng }));

  const map = (
    <MapView
      pins={pins}
      activeSlug={hover}
      onSelect={(slug) => {
        setHover(slug);
        document.getElementById(`card-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }}
      className="h-full w-full"
    />
  );

  return (
    <div>
      <div className="sticky top-[72px] z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2.5 px-4 py-3.5 lg:min-h-[72px] lg:px-6">
          <Select label="Where" value={area} onChange={setArea} options={areaOptions} variant="pill" panelClass="w-[340px]" />
          <DatesPicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e); }} variant="pill" placeholder="Dates" panelClass="w-[720px]" />
          <GuestsPicker value={guests} onChange={setGuests} variant="pill" label="Guests" align="left" />
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
              filterCount ? "border-brand bg-brand-tint text-brand" : "border-line hover:border-ink/40"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" />
            </svg>
            Filters{filterCount ? ` · ${filterCount}` : ""}
          </button>
          <button
            type="button"
            aria-pressed={onlySaved}
            onClick={() => setOnlySaved((v) => !v)}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition ${
              onlySaved ? "border-brand bg-brand-tint text-brand" : "border-line hover:border-ink/40"
            }`}
          >
            <HeartIcon filled={onlySaved} size={16} />
            Saved{saved.length ? ` · ${saved.length}` : ""}
          </button>
          <div className="ml-auto flex items-center gap-3">
            {dirty && (
              <button
                type="button"
                className="text-sm font-medium text-brand underline underline-offset-4"
                onClick={() => {
                  setArea("");
                  setGuests(noGuests);
                  setStart("");
                  setEnd("");
                  setFilters(emptyFilters);
                  setOnlySaved(false);
                }}
              >
                Clear all
              </button>
            )}
            <Select label="Sort" value={sort} onChange={setSort} options={sortOptions} variant="pill" align="right" panelClass="w-[240px]" />
          </div>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <section className={`px-4 pb-24 pt-6 lg:px-6 lg:pb-10 ${mobileMap ? "hidden lg:block" : ""}`}>
          {children}
          <p className="mb-5 mt-6 text-sm text-muted" aria-live="polite">
            <strong className="font-medium text-ink">
              {results.length} {results.length === 1 ? "apartment" : "apartments"}
            </strong>
            {guests.children ? " · homes that don't allow children are hidden" : ""}
            {start && end ? " · prices are monthly — we confirm availability for your dates after you request to book" : " · add dates to see an estimated total"}
          </p>
          {results.length ? (
            <div className="grid gap-5 sm:grid-cols-2">
              {results.map((a, i) => (
                <div key={a.slug} id={`card-${a.slug}`} className="scroll-mt-40">
                  <ApartmentCard apt={a} priority={i < 2} active={hover === a.slug} onHover={setHover} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-soft p-12 text-center">
              <p className="font-serif text-2xl">No exact matches</p>
              <p className="mt-2 text-muted">Try widening your filters — or tell us what you need and we&apos;ll find it.</p>
            </div>
          )}
        </section>

        <aside className="hidden p-4 pl-0 lg:block">
          <div className="sticky top-[160px] h-[calc(100vh-176px)] overflow-hidden rounded-3xl border border-line">{map}</div>
        </aside>
        {mobileMap && <div className="h-[calc(100vh-150px)] lg:hidden">{map}</div>}
      </div>

      <button
        type="button"
        onClick={() => setMobileMap((v) => !v)}
        className="btn btn-dark fixed bottom-6 left-1/2 z-40 -translate-x-1/2 shadow-xl lg:hidden"
      >
        {mobileMap ? "Show list" : "Show map"}
      </button>

      <FiltersModal open={filtersOpen} onClose={() => setFiltersOpen(false)} value={filters} onChange={setFilters} count={results.length} />
    </div>
  );
}
