"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AUTOPLAY_MS = 5000;

type Review = { name: string; role: string; text: string; rating?: number };

export default function ReviewsCarousel({ items }: { items: Review[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(items.length);
  const [playing, setPlaying] = useState(true); // the visitor's pause button
  const [hovered, setHovered] = useState(false); // hover, keyboard focus or touch holds the slide
  const touchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /** One scroll step = one card plus the gap. How many steps fit depends on how many cards are visible. */
  const metrics = useCallback(() => {
    const el = track.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = first.offsetWidth + gap;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    return { el, step, max };
  }, []);

  // The last cards share the final view, so there are fewer reachable positions than reviews.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const m = metrics();
      if (m) setPages(Math.max(1, Math.min(items.length, Math.round(m.max / m.step) + 1)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [items.length, metrics]);

  const go = useCallback(
    (i: number) => {
      const m = metrics();
      if (m) m.el.scrollTo({ left: Math.min(i * m.step, m.max), behavior: "smooth" });
    },
    [metrics],
  );

  // Auto-slide: move on after a few seconds, loop back at the end. Off for "reduce motion".
  useEffect(() => {
    if (!playing || hovered || pages < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => {
      if (!document.hidden) go(page + 1 >= pages ? 0 : page + 1);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [page, pages, playing, hovered, go]);

  useEffect(() => () => clearTimeout(touchTimer.current), []);

  function onScroll() {
    const m = metrics();
    if (!m) return;
    const atEnd = m.max > 0 && m.el.scrollLeft >= m.max - 2;
    setPage(atEnd ? pages - 1 : Math.min(pages - 1, Math.round(m.el.scrollLeft / m.step)));
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      onTouchStart={() => {
        // Hold the slide while a finger is on it, and for a few seconds after so it can be read.
        clearTimeout(touchTimer.current);
        setHovered(true);
        touchTimer.current = setTimeout(() => setHovered(false), 8000);
      }}
    >
      <ul
        ref={track}
        onScroll={onScroll}
        aria-label="Guest reviews"
        className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((r, i) => {
          const rating = Math.max(0, Math.min(5, r.rating ?? 5));
          return (
            <li key={`${r.name}-${i}`} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
              <figure className="flex h-full flex-col rounded-3xl border border-line bg-white p-7">
                <div className="flex items-center gap-3">
                  <span aria-hidden className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-tint font-serif text-lg text-brand">
                    {r.name[0]}
                  </span>
                  <figcaption className="text-sm">
                    <strong className="block font-medium text-ink">{r.name}</strong>
                    <span className="text-brand">{r.role}</span>
                  </figcaption>
                </div>
                <div role="img" aria-label={`${rating} out of 5 stars`} className="mt-4 text-amber-400">
                  {"★".repeat(rating)}
                  <span className="text-line">{"★".repeat(5 - rating)}</span>
                </div>
                <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">&ldquo;{r.text}&rdquo;</blockquote>
              </figure>
            </li>
          );
        })}
      </ul>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause automatic sliding" : "Resume automatic sliding"}
            className="flex h-6 w-6 items-center justify-center rounded-full text-muted transition hover:text-ink"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              {playing ? <path d="M1.5 0.5h2.5v9H1.5zM6 0.5h2.5v9H6z" /> : <path d="M1.5 0.5l7.5 4.5-7.5 4.5z" />}
            </svg>
          </button>
          <div className="flex items-center gap-2">
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Show reviews, position ${i + 1} of ${pages}`}
              aria-current={i === page}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${i === page ? "w-6 bg-brand" : "w-2 bg-line"}`}
            />
          ))}
          </div>
        </div>
      )}
    </div>
  );
}
