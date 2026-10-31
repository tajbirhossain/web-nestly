import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function PageHero({
  kicker,
  title,
  text,
  image = "/images/stock/nyc-skyline-apt.jpg",
  actions,
}: {
  kicker?: string;
  title: string;
  text?: string;
  image?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative flex min-h-[56vh] items-end overflow-hidden bg-ink pb-16 pt-32 text-white">
      <Image src={image} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/35 via-ink/70 to-ink/90" />
      <div className="container-n relative">
        {kicker && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] opacity-90">{kicker}</p>}
        <h1 className="max-w-3xl text-[clamp(38px,6vw,64px)] leading-[1.05]">{title}</h1>
        {text && <p className="mt-4 max-w-xl text-lg leading-relaxed opacity-90">{text}</p>}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </div>
    </section>
  );
}

export function Section({
  children,
  tone = "white",
  className = "",
}: {
  children: ReactNode;
  tone?: "white" | "soft" | "dark";
  className?: string;
}) {
  const bg = tone === "soft" ? "bg-soft" : tone === "dark" ? "bg-ink text-white" : "bg-white";
  return (
    <section className={`${bg} py-20 md:py-24 ${className}`}>
      <div className="container-n">{children}</div>
    </section>
  );
}

export function Heading({
  kicker,
  title,
  text,
  center = false,
}: {
  kicker?: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? "mx-auto text-center" : ""} max-w-2xl`}>
      {kicker && <p className="kicker mb-3">{kicker}</p>}
      <h2 className="text-[clamp(28px,4vw,42px)] leading-[1.15]">{title}</h2>
      {text && <p className="mt-4 text-[17px] leading-relaxed text-muted">{text}</p>}
    </div>
  );
}

export function CtaBand({
  title,
  text,
  href,
  label,
}: {
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <section className="bg-brand py-20 text-white">
      <div className="container-n flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="text-[clamp(28px,4vw,40px)] leading-tight">{title}</h2>
          <p className="mt-3 text-lg opacity-90">{text}</p>
        </div>
        <Link href={href} className="btn bg-white !text-ink hover:bg-soft">
          {label}
        </Link>
      </div>
    </section>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl text-[17px] leading-8 text-muted [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:text-ink [&_li]:mt-2 [&_p]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
      {children}
    </div>
  );
}

/** Split hero (copy + CTAs on the left, photo collage on the right) — Blueground "company stays" pattern. */
export function SplitHero({
  kicker,
  title,
  text,
  actions,
  images,
}: {
  kicker?: string;
  title: string;
  text: string;
  actions?: ReactNode;
  images: string[];
}) {
  const [a, b, c, d] = images;
  const tile = "relative overflow-hidden rounded-3xl bg-soft";
  return (
    <section className="bg-gradient-to-br from-[#f1f1ff] via-white to-[#f6f8ff] pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="container-n grid items-center gap-12 md:grid-cols-[1.05fr_1fr]">
        <div>
          {kicker && <p className="kicker mb-4">{kicker}</p>}
          <h1 className="text-[clamp(34px,5vw,56px)] leading-[1.06] text-[#2a2a5c]">{title}</h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">{text}</p>
          {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
        </div>
        <div className="grid h-[380px] grid-cols-6 grid-rows-6 gap-3 md:h-[460px]" aria-hidden>
          <div className={`${tile} col-span-4 row-span-4`}><Image src={a} alt="" fill priority sizes="(min-width:768px) 28vw, 60vw" className="object-cover" /></div>
          <div className={`${tile} col-span-2 col-start-5 row-span-3`}><Image src={b} alt="" fill sizes="16vw" className="object-cover" /></div>
          <div className={`${tile} col-span-2 col-start-5 row-start-4 row-span-3`}><Image src={c} alt="" fill sizes="16vw" className="object-cover" /></div>
          <div className={`${tile} col-span-4 row-start-5 row-span-2`}><Image src={d} alt="" fill sizes="28vw" className="object-cover" /></div>
        </div>
      </div>
    </section>
  );
}

/** Cards with an illustration panel, a title and arrow bullets. */
export function FeatureCards({ items }: { items: { icon: string; title: string; bullets: string[] }[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {items.map((i) => (
        <article key={i.title} className="rounded-3xl border border-line bg-white p-3">
          <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f1f1ff] to-[#f8f8ff]">
            <Image src={i.icon} alt="" width={120} height={120} className="h-28 w-auto object-contain" />
          </div>
          <div className="px-3 pb-3 pt-5">
            <h3 className="text-xl">{i.title}</h3>
            <ul className="mt-3 space-y-2">
              {i.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-[15px] text-muted">
                  <span aria-hidden className="text-brand">→</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Bordered logo cells. */
export function LogoGrid({ logos }: { logos: { name: string; src: string }[] }) {
  return (
    <ul className="grid grid-cols-2 overflow-hidden rounded-3xl border border-line sm:grid-cols-3 lg:grid-cols-6">
      {logos.map((l) => (
        <li key={l.name} className="flex h-28 items-center justify-center border-b border-r border-line bg-white p-6 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(3n)]:border-r-0 lg:[&:nth-child(3n)]:border-r lg:[&:nth-child(6n)]:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 sm:[&:nth-last-child(-n+3)]:border-b-0 lg:[&:nth-last-child(-n+6)]:border-b-0">
          <Image src={l.src} alt={l.name} width={110} height={36} className="h-8 w-auto opacity-70 grayscale" />
        </li>
      ))}
    </ul>
  );
}
