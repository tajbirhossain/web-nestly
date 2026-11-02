"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "@/components/ui/Select";
import { DatesPicker, GuestsPicker, guestTotal, noGuests } from "@/components/ui/Pickers";
import { areaOptions } from "@/lib/data";

export default function SearchBar() {
  const router = useRouter();
  const [area, setArea] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guests, setGuests] = useState(noGuests);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (area) params.set("area", area);
    if (start) params.set("movein", start);
    if (end) params.set("moveout", end);
    if (guestTotal(guests)) {
      params.set("adults", String(guests.adults));
      if (guests.children) params.set("children", String(guests.children));
    }
    router.push(`/apartments${params.size ? `?${params}` : ""}`);
  }

  const sep = <span aria-hidden className="hidden h-8 w-px shrink-0 bg-line md:block" />;

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Search apartments"
      className="flex w-full max-w-4xl flex-col gap-1 rounded-3xl bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,.35)] md:flex-row md:items-center md:rounded-full"
    >
      <Select
        label="Where"
        placeholder="Anywhere in NYC"
        value={area}
        onChange={setArea}
        options={areaOptions}
        className="md:flex-[1.2]"
        panelClass="w-[360px]"
      />
      {sep}
      <DatesPicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e); }} label="Check in – out" placeholder="Add dates" className="md:flex-[1.3]" />
      {sep}
      <GuestsPicker value={guests} onChange={setGuests} className="md:flex-1" />
      <button type="submit" className="btn btn-primary mt-1 gap-2 md:mt-0 md:min-h-[56px] md:px-8">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        Search
      </button>
    </form>
  );
}
