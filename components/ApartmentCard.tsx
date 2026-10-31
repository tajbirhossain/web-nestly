"use client";

import Image from "next/image";
import Link from "next/link";
import CardGallery from "@/components/CardGallery";
import { HeartIcon, SqftIcon } from "@/components/ui/icons";
import { fmtShort } from "@/components/ui/dates";
import { bedLabel, money, type Apartment } from "@/lib/data";
import { useSaved } from "@/lib/saved";

export default function ApartmentCard({
  apt,
  priority = false,
  active = false,
  onHover,
}: {
  apt: Apartment;
  priority?: boolean;
  active?: boolean;
  onHover?: (slug: string | null) => void;
}) {
  const { saved, toggle } = useSaved();
  const isSaved = saved.includes(apt.slug);

  return (
    <article
      onMouseEnter={() => onHover?.(apt.slug)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative rounded-3xl border bg-white p-2 transition duration-300 hover:shadow-[0_18px_40px_rgba(23,24,25,.1)] ${
        active ? "border-brand shadow-[0_18px_40px_rgba(92,92,255,.18)]" : "border-line"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-soft">
        <CardGallery
          images={apt.images}
          alt={`${apt.title} in ${apt.neighborhood}`}
          priority={priority}
          href={`/apartments/${apt.slug}`}
          sizes="(min-width:1280px) 25vw, (min-width:640px) 45vw, 100vw"
        />
        {apt.featured && (
          <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-ink shadow-sm">
            🔥 Popular home
          </span>
        )}
        <button
          type="button"
          aria-pressed={isSaved}
          aria-label={isSaved ? `Remove ${apt.title} from saved homes` : `Save ${apt.title}`}
          onClick={() => toggle(apt.slug)}
          className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 ${
            isSaved ? "text-[#e5484d]" : "text-ink"
          }`}
        >
          <HeartIcon filled={isSaved} size={18} />
        </button>
        <span className="pointer-events-none absolute left-4 top-[calc(100%-2.6rem)] z-10 text-xs font-medium text-white [text-shadow:0_1px_8px_rgba(0,0,0,.6)] max-sm:hidden">
          Available {fmtShort(apt.availableFrom)}
        </span>
      </div>

      <div className="px-3 pb-3 pt-4">
        <p className="font-serif text-xl leading-none">
          {money(apt.price)}
          <span className="font-sans text-sm font-normal text-muted"> / month</span>
        </p>
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <li className="flex items-center gap-1.5">
            <Image src="/images/icons/bed.png" alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
            {bedLabel(apt.beds)}
          </li>
          <li className="flex items-center gap-1.5">
            <Image src="/images/icons/bath.png" alt="" width={18} height={18} className="h-[18px] w-[18px] object-contain" />
            {apt.baths} Bath
          </li>
          <li className="flex items-center gap-1.5">
            <SqftIcon />
            {apt.sqft.toLocaleString()} ft²
          </li>
        </ul>
        <h3 className="mt-3 line-clamp-1 text-[15px] font-sans font-medium leading-snug">
          <Link href={`/apartments/${apt.slug}`} className="after:absolute after:inset-0 after:z-10 after:rounded-3xl">
            {apt.title}
          </Link>
        </h3>
        <p className="mt-0.5 text-[13px] text-muted">
          {apt.address ? `${apt.address} · ` : ""}
          {apt.neighborhood}, {apt.borough}
        </p>
      </div>
    </article>
  );
}
