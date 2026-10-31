"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function CardGallery({
  images,
  alt,
  priority = false,
  sizes,
  href,
}: {
  images: string[];
  alt: string;
  priority?: boolean;
  sizes: string;
  href: string;
}) {
  const router = useRouter();
  const track = useRef<HTMLDivElement>(null);
  const [i, setI] = useState(0);

  function go(to: number) {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, to));
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  const arrow =
    "relative z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg text-ink opacity-0 shadow transition hover:bg-white focus-visible:opacity-100 group-hover:opacity-100 disabled:hidden";

  return (
    <>
      <div
        ref={track}
        onClick={() => router.push(href)}
        onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="absolute inset-0 z-[15] flex cursor-pointer snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((src, n) => (
          <div key={src + n} className="relative h-full w-full shrink-0 snap-start">
            <Image
              src={src}
              alt={n === 0 ? alt : ""}
              fill
              priority={priority && n === 0}
              sizes={sizes}
              className="object-cover"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-20 flex items-center justify-between px-3">
            <button type="button" aria-label="Previous photo" disabled={i === 0} onClick={() => go(i - 1)} className={`${arrow} pointer-events-auto`}>
              ‹
            </button>
            <span className="pointer-events-none flex gap-1.5" aria-hidden>
              {images.slice(0, 6).map((_, n) => (
                <span key={n} className={`h-1.5 rounded-full bg-white transition-all ${n === i ? "w-4" : "w-1.5 opacity-70"}`} />
              ))}
            </span>
            <button type="button" aria-label="Next photo" disabled={i === images.length - 1} onClick={() => go(i + 1)} className={`${arrow} pointer-events-auto`}>
              ›
            </button>
          </div>
        </>
      )}
    </>
  );
}
