import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import InquiryForm from "@/components/InquiryForm";
import { FeatureCards, Heading, Section, SplitHero } from "@/components/sections";

export const metadata: Metadata = {
  title: "Relocation",
  description: "Move to NYC with a furnished Nestly apartment while you find your footing.",
};

const faqs = [
  { q: "How long can I stay while I search for a permanent home?", a: "Stays start at 30 nights and can be extended, so you can take the time you need." },
  { q: "Can you help me choose a neighborhood?", a: "Yes — tell us how you live and work and we'll suggest the right side of town across Manhattan, the Bronx, Brooklyn and New Jersey." },
  { q: "What's in the apartment when I arrive?", a: "Furnished, professionally cleaned, with linens, a fully equipped kitchen and Wi‑Fi set up." },
];

export default function RelocationPage() {
  return (
    <>
      <SplitHero
        kicker="Settle in smoothly"
        title="Relocate to New York without the friction"
        text="Move to NYC with a furnished Nestly apartment while you find your footing — flexible 30+ day stays."
        images={["/images/stock/nyc-apartment-living.jpg", "/images/stock/nyc-neighborhood.jpg", "/images/stock/furnished-interior.jpg", "/images/stock/nyc-skyline-apt.jpg"]}
        actions={
          <>
            <Link href="/apartments" className="btn btn-dark">Find a home</Link>
            <a href="#help" className="btn btn-outline !border-ink !text-ink">Talk to our team</a>
          </>
        }
      />

      <Section>
        <Heading center kicker="A soft landing" title="Everything ready when you arrive" />
        <FeatureCards
          items={[
            { icon: "/images/3d/key.png", title: "Move-in ready", bullets: ["Kitchens, linens and essentials", "Professionally cleaned", "Utilities set up"] },
            { icon: "/images/3d/map.png", title: "Right neighborhood", bullets: ["Options across Manhattan, the Bronx, Brooklyn and New Jersey", "Neighborhood guidance", "Try an area before you commit"] },
            { icon: "/images/3d/calendar.png", title: "Flexible terms", bullets: ["Stay month-plus", "Extend while you search", "No long lease required"] },
            { icon: "/images/3d/wifi.png", title: "Settle in fast", bullets: ["Fast Wi‑Fi from day one", "Space to work from home", "24/7 app support"] },
          ]}
        />
      </Section>

      <Section tone="soft">
        <div id="help" className="grid scroll-mt-24 gap-12 md:grid-cols-[1fr_1.1fr]">
          <Heading kicker="Relocating soon?" title="Share your move date and must-haves" text="We'll help you land softly." />
          <div className="rounded-3xl bg-white p-7 shadow-[0_10px_30px_rgba(23,24,25,.06)]">
            <InquiryForm
              type="relocation"
              submitLabel="Get relocation help"
              fields={[
                { name: "name", label: "Name", required: true, half: true },
                { name: "email", label: "Email", type: "email", required: true, half: true },
                { name: "stay", label: "Dates", kind: "dates" },
                { name: "budget", label: "Monthly budget", half: true },
                { name: "guests", label: "Guests", kind: "guests", half: true },
                { name: "message", label: "Must-haves", textarea: true },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section>
        <Heading center title="Relocation FAQ" />
        <Faq items={faqs} />
      </Section>
    </>
  );
}
