"use client";

import { useRef, useState } from "react";

type Review = { name: string; role: string; text: string };

export default function ReviewsCarousel({ items }: { items: Review[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [page, setPage] = useState(0);

  function go(i: number) {
    const el = track.current;
    if (!el) return;
    const card = el.children[i] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function onScroll() {
    const el = track.current;
    if (!el) return;
    const w = (el.children[0] as HTMLElement).offsetWidth + 20;
    setPage(Math.min(items.length - 1, Math.round(el.scrollLeft / w)));
  }

  return (
    <div>
      <ul
        ref={track}
        onScroll={onScroll}
        aria-label="Guest reviews"
        className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((r) => (
          <li key={r.name} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
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
              <div aria-label="5 out of 5 stars" className="mt-4 text-amber-400">★★★★★</div>
              <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">&ldquo;{r.text}&rdquo;</blockquote>
            </figure>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((r, i) => (
          <button
            key={r.name}
            type="button"
            aria-label={`Show review ${i + 1}`}
            aria-current={i === page}
            onClick={() => go(i)}
            className={`h-2 rounded-full transition-all ${i === page ? "w-6 bg-brand" : "w-2 bg-line"}`}
          />
        ))}
      </div>
    </div>
  );
}
