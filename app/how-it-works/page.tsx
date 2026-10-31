import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import { CtaBand, FeatureCards, Heading, Section, SplitHero } from "@/components/sections";
import { faqs, steps } from "@/lib/data";

export const metadata: Metadata = {
  title: "How it works",
  description: "Search, request to book for 30+ days, and we confirm your stay personally.",
};

export default function HowItWorksPage() {
  return (
    <>
      <SplitHero
        kicker="Simple by design"
        title="How Nestly works"
        text="Search, request to book for 30+ days, and we confirm your stay personally — no surprise hotel checkout."
        images={["/images/stock/furnished-interior.jpg", "/images/stock/nyc-apartment-living.jpg", "/images/stock/modern-workspace.jpg", "/images/stock/nyc-skyline-apt.jpg"]}
        actions={
          <>
            <Link href="/apartments" className="btn btn-dark">Browse apartments</Link>
            <Link href="/become-a-host" className="btn btn-outline !border-ink !text-ink">Become a host</Link>
          </>
        }
      />

      <Section>
        <Heading kicker="For guests" title="From first search to settling in" />
        <ol className="grid gap-5 md:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="relative rounded-3xl border border-line bg-white p-7">
              <span className="font-serif text-4xl text-brand">{s.n}</span>
              <h3 className="mt-4 text-xl">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="soft">
        <Heading center kicker="Your stay with Nestly" title="Move-in ready from day one" />
        <FeatureCards
          items={[
            { icon: "/images/icons/curated-space.png", title: "Furnished & cleaned", bullets: ["Professionally cleaned before arrival", "Fresh linens and towels", "Fully equipped kitchen"] },
            { icon: "/images/icons/wifi-included.png", title: "Utilities & Wi‑Fi", bullets: ["High-speed internet set up", "Utilities typically included", "Space to focus and work"] },
            { icon: "/images/icons/efforless-booking.png", title: "Personal booking", bullets: ["Request to book, no instant checkout", "We confirm availability with you", "30-night minimum"] },
            { icon: "/images/icons/neighborhood-access.png", title: "Support", bullets: ["24/7 app support", "Neighborhood guides", "A real person to message"] },
          ]}
        />
      </Section>

      <Section>
        <Heading center title="Frequently asked questions" />
        <Faq items={faqs} />
      </Section>

      <CtaBand title="Ready when you are" text="Browse live apartments or ask Nestly to match you with a home." href="/apartments" label="See apartments" />
    </>
  );
}
