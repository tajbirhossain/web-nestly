"use client";

import { useState } from "react";
import { money } from "@/lib/data";

const BUCKETS = 28;

const thumb =
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-brand [&::-moz-range-thumb]:bg-white";

/** Dual-handle budget slider with a histogram of listing prices (Blueground-style). */
export default function PriceRange({
  min,
  max,
  step,
  prices,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step: number;
  prices: number[];
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [lo, hi] = value;
  // Typing buffers so partial input ("5") doesn't get clamped mid-keystroke.
  const [draft, setDraft] = useState<{ lo?: string; hi?: string }>({});

  const focusEdit = (el: HTMLInputElement, which: "lo" | "hi", n: number) => {
    setDraft((d) => ({ ...d, [which]: String(n) }));
    requestAnimationFrame(() => el.select());
  };

  const buckets = Array.from({ length: BUCKETS }, (_, i) => {
    const from = min + ((max - min) * i) / BUCKETS;
    const to = min + ((max - min) * (i + 1)) / BUCKETS;
    const count = prices.filter((p) => p >= from && (i === BUCKETS - 1 ? p <= to : p < to)).length;
    return { from, to, count };
  });
  const peak = Math.max(1, ...buckets.map((b) => b.count));
  const pct = (n: number) => ((n - min) / (max - min)) * 100;

  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n / step) * step));
  const commit = (which: "lo" | "hi") => {
    const raw = draft[which];
    setDraft((d) => ({ ...d, [which]: undefined }));
    if (raw === undefined) return;
    const n = Number(raw.replace(/[^\d]/g, ""));
    if (!Number.isFinite(n) || raw === "") return;
    onChange(which === "lo" ? [Math.min(clamp(n), hi - step), hi] : [lo, Math.max(clamp(n), lo + step)]);
  };

  const input = "w-full rounded-2xl border border-line px-4 py-3 text-[15px] tabular-nums outline-none transition focus:border-brand focus:shadow-[0_0_0_3px_rgba(92,92,255,.15)]";

  return (
    <div>
      <div className="relative mt-2 h-[84px]" aria-hidden>
        <div className="absolute inset-x-3.5 bottom-3 top-0 flex items-end gap-[3px]">
          {buckets.map((b, i) => {
            const inside = b.to > lo && b.from < hi;
            return (
              <span
                key={i}
                className={`flex-1 rounded-t-[3px] transition-colors ${inside ? "bg-brand" : "bg-line"}`}
                style={{ height: b.count ? `${Math.max(14, (b.count / peak) * 100)}%` : "3px", opacity: b.count ? 1 : 0.6 }}
              />
            );
          })}
        </div>
      </div>

      <div className="relative mx-0 h-7">
        <div className="absolute inset-x-3.5 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-brand"
          style={{ left: `calc(14px + (100% - 28px) * ${pct(lo) / 100})`, right: `calc(14px + (100% - 28px) * ${1 - pct(hi) / 100})` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label="Minimum monthly price"
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className={`pointer-events-none absolute inset-0 h-7 w-full appearance-none bg-transparent ${thumb}`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label="Maximum monthly price"
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className={`pointer-events-none absolute inset-0 h-7 w-full appearance-none bg-transparent ${thumb}`}
        />
      </div>

      <div className="mt-5 flex items-end justify-between gap-6">
        <label className="block flex-1">
          <span className="mb-1.5 block text-xs font-medium text-muted">From</span>
          <input
            inputMode="numeric"
            className={input}
            value={draft.lo ?? money(lo)}
            onFocus={(e) => focusEdit(e.currentTarget, "lo", lo)}
            onChange={(e) => setDraft((d) => ({ ...d, lo: e.target.value }))}
            onBlur={() => commit("lo")}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        </label>
        <span aria-hidden className="mb-4 h-px w-4 bg-line" />
        <label className="block flex-1">
          <span className="mb-1.5 block text-xs font-medium text-muted">To</span>
          <input
            inputMode="numeric"
            className={input}
            value={draft.hi ?? `${money(hi)}${hi >= max ? "+" : ""}`}
            onFocus={(e) => focusEdit(e.currentTarget, "hi", hi)}
            onChange={(e) => setDraft((d) => ({ ...d, hi: e.target.value }))}
            onBlur={() => commit("hi")}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          />
        </label>
      </div>
    </div>
  );
}
