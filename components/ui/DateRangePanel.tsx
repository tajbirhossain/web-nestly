"use client";

import { useState } from "react";
import { useMinNights } from "@/components/BookingRules";
import { addDays, fromISO, nightsBetween, toISO } from "@/components/ui/dates";

type Props = {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  onDone: () => void;
  /** Stays that are already taken; those days cannot be picked. Check-out on a booked check-in day is fine. */
  blocked?: { start: string; end: string }[];
};

const DOW = ["S", "M", "T", "W", "T", "F", "S"];
const durations = [
  { label: "2 months", days: 61 },
  { label: "3 months", days: 91 },
  { label: "6 months", days: 182 },
];

function monthDays(first: Date) {
  const lead = first.getDay();
  const count = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))] as (Date | null)[];
}

export default function DateRangePanel({ start, end, onChange, onDone, blocked = [] }: Props) {
  const MIN_NIGHTS = useMinNights();
  const quick = [{ label: `${MIN_NIGHTS} night${MIN_NIGHTS > 1 ? "s" : ""}`, days: MIN_NIGHTS }, ...durations.filter((d) => d.days > MIN_NIGHTS)];
  // True when a stay from a to b would overlap a taken one (back-to-back is allowed).
  const clash = (a: Date, b: Date) => blocked.some((r) => toISO(a) < r.end && toISO(b) > r.start);
  const taken = (d: Date) => blocked.some((r) => toISO(d) >= r.start && toISO(d) < r.end);
  // Mounted only while the popover is open, so reading the clock here never runs during prerender.
  const [today] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  });
  const [view, setView] = useState(() => {
    const base = start ? fromISO(start) : today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [hover, setHover] = useState<Date | null>(null);

  const s = start ? fromISO(start) : null;
  const e = end ? fromISO(end) : null;
  const minEnd = s ? addDays(s, MIN_NIGHTS) : null;

  function pick(d: Date) {
    if (!s || e || d <= s) return onChange(toISO(d), "");
    if (minEnd && d < minEnd) return;
    onChange(start, toISO(d));
  }

  const previewEnd = s && !e && hover && minEnd && hover >= minEnd ? hover : null;
  const rangeEnd = e ?? previewEnd;

  const nights = s && e ? nightsBetween(s, e) : 0;
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  function month(offset: number, className: string) {
    const first = new Date(view.getFullYear(), view.getMonth() + offset, 1);
    return (
      <div className={className}>
        <p className="mb-3 text-center font-serif text-base">
          {first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-muted">
          {DOW.map((d, i) => (
            <span key={i} className="py-1">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7" onMouseLeave={() => setHover(null)}>
          {monthDays(first).map((d, i) => {
            if (!d) return <span key={i} />;
            const past = d < today;
            const tooShort = !!(s && !e && d > s && minEnd && d < minEnd);
            const choosingEnd = !!s && !e && d > s;
            const unavailable = choosingEnd ? clash(s!, d) : taken(d);
            const disabled = past || tooShort || unavailable;
            const isStart = !!s && d.getTime() === s.getTime();
            const isEnd = !!rangeEnd && d.getTime() === rangeEnd.getTime();
            const inRange = !!s && !!rangeEnd && d > s && d < rangeEnd;
            const band = inRange ? "bg-brand-tint" : isStart && rangeEnd ? "rounded-l-full bg-brand-tint" : isEnd ? "rounded-r-full bg-brand-tint" : "";
            const isToday = d.getTime() === today.getTime();
            return (
              <span key={i} className={`flex h-10 items-center justify-center ${band}`}>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  onMouseEnter={() => setHover(d)}
                  aria-label={`${fmt(d)}${tooShort ? ` — below the ${MIN_NIGHTS}-night minimum` : ""}${unavailable ? " — not available" : ""}`}
                  aria-pressed={isStart || isEnd}
                  title={unavailable ? "Already booked" : tooShort ? `Minimum stay is ${MIN_NIGHTS} nights` : undefined}
                  className={`h-10 w-10 rounded-full text-sm transition ${
                    isStart || (isEnd && e)
                      ? "bg-brand font-medium text-white"
                      : disabled
                        ? "cursor-not-allowed text-ink/25"
                        : "hover:bg-brand/15"
                  } ${tooShort || unavailable ? "line-through decoration-ink/20" : ""} ${isToday && !isStart ? "font-semibold ring-1 ring-ink/30" : ""}`}
                >
                  {d.getDate()}
                </button>
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  const navBtn = "flex h-9 w-9 items-center justify-center rounded-full border border-line transition hover:border-ink disabled:opacity-30 disabled:hover:border-line";
  const prevDisabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <button type="button" aria-label="Previous month" disabled={prevDisabled} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className={navBtn}>
          ‹
        </button>
        <p className="text-sm text-muted">
          {!s ? "Select your check-in date" : !e ? `Now select check-out (${MIN_NIGHTS} nights or more)` : `${fmt(s)} → ${fmt(e)}`}
        </p>
        <button type="button" aria-label="Next month" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className={navBtn}>
          ›
        </button>
      </div>

      <div className="flex gap-8">
        {month(0, "flex-1")}
        {month(1, "hidden flex-1 md:block")}
      </div>

      {(
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted">Stay for</span>
          {quick.map((d) => {
            const target = s ? toISO(addDays(s, d.days)) : "";
            const blockedStay = !!s && clash(s, addDays(s, d.days));
            const active = !!s && end === target;
            return (
              <button
                key={d.label}
                type="button"
                disabled={!s || blockedStay}
                title={blockedStay ? "Overlaps an existing booking" : undefined}
                onClick={() => onChange(start, target)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? "border-brand bg-brand text-white" : "border-line enabled:hover:border-ink"}`}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
        <p className="text-sm text-muted">
          {nights ? <><strong className="font-medium text-ink">{nights} nights</strong> · minimum stay {MIN_NIGHTS}</> : `Minimum stay is ${MIN_NIGHTS} nights`}
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={() => onChange("", "")} className="rounded-full px-4 py-2 text-sm font-medium underline underline-offset-4 hover:text-brand">
            Clear
          </button>
          <button type="button" onClick={onDone} className="btn btn-primary !min-h-10 !px-6 !text-sm">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
