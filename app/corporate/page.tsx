import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import InquiryForm from "@/components/InquiryForm";
import { FeatureCards, Heading, LogoGrid, Section, SplitHero } from "@/components/sections";
import { logos } from "@/lib/data";

export const metadata: Metadata = {
  title: "Corporate housing",
  description: "Furnished NYC apartments for traveling teams with Wi‑Fi, workspace, and flexible 30+ day terms.",
};

const faqs = [
  { q: "Can employees or HR book directly?", a: "Yes. Individual travelers can request a stay themselves, or your HR, mobility or travel team can send us one brief for the whole group." },
  { q: "What is the minimum stay for corporate bookings?", a: "30 nights. Longer assignments and extensions are easy to arrange." },
  { q: "Do you handle team deployments?", a: "Share headcount, dates and preferred neighborhoods and we'll put together a set of options, with one point of contact throughout." },
  { q: "Are utilities and Wi‑Fi included?", a: "Most Nestly apartments include utilities and high-speed Wi‑Fi. We confirm the details in our follow-up." },
];

export default function CorporatePage() {
  return (
    <>
      <SplitHero
        kicker="Nestly for business"
        title="Corporate housing for stays of a month or more"
        text="Furnished NYC apartments with Wi‑Fi, workspace, and flexible 30+ day terms. You or your team members can request directly."
        images={["/images/stock/modern-workspace.jpg", "/images/stock/nyc-skyline-apt.jpg", "/images/stock/furnished-interior.jpg", "/images/stock/nyc-apartment-living.jpg"]}
        actions={
          <>
            <a href="#quote" className="btn btn-dark">Contact us</a>
            <Link href="/apartments" className="btn btn-outline !border-ink !text-ink">Find an apartment</Link>
          </>
        }
      />

      <Section>
        <Heading center kicker="The Nestly standard" title="A single solution for your corporate housing needs" />
        <FeatureCards
          items={[
            { icon: "/images/3d/handshake.png", title: "Book directly", bullets: ["Employees or HR can request", "One point of contact", "Personal confirmation of every stay"] },
            { icon: "/images/3d/briefcase.png", title: "Corporate apartments", bullets: ["Professionally furnished and cleaned", "Move-in ready from day one", "Flexible 30+ day terms"] },
            { icon: "/images/3d/laptop.png", title: "Work-ready", bullets: ["High-speed Wi‑Fi set up before arrival", "Space to focus and decompress", "Utilities typically included"] },
            { icon: "/images/3d/map.png", title: "Right neighborhood", bullets: ["Manhattan business districts", "Brooklyn options as inventory grows", "Transit-friendly buildings"] },
          ]}
        />
      </Section>

      <Section tone="soft">
        <Heading center kicker="Trusted by" title="Serving teams at leading companies" text="From individual bookings to team deployments." />
        <LogoGrid logos={logos} />
      </Section>

      <Section className="scroll-mt-16">
        <div id="quote" className="grid scroll-mt-24 gap-12 md:grid-cols-[1fr_1.1fr]">
          <Heading kicker="Team deployments" title="Planning a stay for your team?" text="Share headcount, dates, and preferred neighborhoods — we'll respond quickly with options." />
          <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_10px_30px_rgba(23,24,25,.06)]">
            <InquiryForm
              type="corporate"
              submitLabel="Request a quote"
              fields={[
                { name: "name", label: "Name", required: true, half: true },
                { name: "email", label: "Work email", type: "email", required: true, half: true },
                { name: "company", label: "Company", half: true },
                { name: "headcount", label: "Team size", kind: "guests", half: true },
                { name: "stay", label: "Dates", kind: "dates" },
                { name: "message", label: "Preferred neighborhoods & notes", textarea: true },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section tone="soft">
        <Heading center title="Corporate housing FAQ" />
        <Faq items={faqs} />
      </Section>
    </>
  );
}
