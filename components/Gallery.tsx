"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  const few = images.length < 3;

  return (
    <>
      <div className="relative grid h-[300px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:h-[440px]">
        {images.slice(0, 5).map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${images.length}`}
            className={`relative overflow-hidden bg-soft ${
              i === 0 ? `col-span-4 row-span-2 ${few ? "" : "md:col-span-2"}` : "hidden md:block"
            }`}
          >
            <Image
              src={src}
              alt={i === 0 ? title : ""}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(min-width:768px) 50vw, 100vw" : "25vw"}
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium shadow transition hover:bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          View all photos ({images.length})
        </button>
      </div>

      {open !== null && (
        <div role="dialog" aria-modal="true" aria-label={`${title} photos`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4">
          <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">
            ×
          </button>
          {images.length > 1 && (
            <>
              <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">‹</button>
              <button type="button" aria-label="Next photo" onClick={() => step(1)} className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20">›</button>
            </>
          )}
          <div className="relative h-full max-h-[80vh] w-full max-w-5xl">
            <Image src={images[open]} alt={`${title} — photo ${open + 1}`} fill sizes="90vw" className="object-contain" />
          </div>
          <p className="absolute bottom-5 text-sm text-white/80">{open + 1} / {images.length}</p>
        </div>
      )}
    </>
  );
}
