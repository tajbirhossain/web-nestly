import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand, Heading, PageHero, Section } from "@/components/sections";

export const metadata: Metadata = {
  title: "About",
  description: "Nestly is built for people who need a real apartment for 30 days or longer — not another hotel room.",
};

const uses = [
  ["Business travel", "Space and privacy hotels can't match."],
  ["Relocation", "A soft landing while you settle permanently."],
  ["Extended leisure", "Live like a local for a month or more."],
  ["Remote work", "Fast Wi‑Fi and room to focus."],
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        kicker="Our story"
        title="Homes for real NYC chapters"
        text="Nestly is built for people who need a real apartment for 30 days or longer — not another hotel room."
        image="/images/stock/story2.jpg"
        actions={
          <>
            <Link href="/apartments" className="btn btn-primary">Browse apartments</Link>
            <Link href="/become-a-host" className="btn btn-ghost">Become a host</Link>
          </>
        }
      />
      <Section>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
            <Image src="/images/stock/story3.jpg" alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div>
            <Heading kicker="The Nestly experience" title="Land in New York and settle in instantly" />
            <p className="-mt-6 text-[17px] leading-relaxed text-muted">
              Utilities ready, Wi‑Fi running, kitchens stocked for living — professionally cleaned with support when you need it.
            </p>
            <ul className="mt-6 space-y-2">
              {["Comfort from day one", "Honest listings and curated interiors", "Clear communication for guests and hosts"].map((x) => (
                <li key={x} className="flex gap-3"><span className="text-brand">✓</span>{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <Section tone="soft">
        <Heading title="Built for how people actually stay" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {uses.map(([t, d]) => (
            <div key={t} className="rounded-3xl bg-white p-7">
              <h3 className="text-xl">{t}</h3>
              <p className="mt-2 text-[15px] text-muted">{d}</p>
            </div>
          ))}
        </div>
      </Section>
      <CtaBand title="Start your Nestly stay" text="Explore apartments or tell us what you need." href="/apartments" label="Find an apartment" />
    </>
  );
}
