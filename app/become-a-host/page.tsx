import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Faq from "@/components/Faq";
import InquiryForm from "@/components/InquiryForm";
import { FeatureCards, Heading, Section, SplitHero } from "@/components/sections";
import { hostSteps } from "@/lib/data";

export const metadata: Metadata = {
  title: "Become a host",
  description: "List your furnished apartment with Nestly and welcome vetted guests for 30+ day stays.",
};

const faqs = [
  { q: "Who can host with Nestly?", a: "Owners and operators of furnished apartments in New York City. We review every application manually before you can list." },
  { q: "How long are guest stays?", a: "A minimum of 30 nights, so you get fewer turnovers and longer, steadier stays." },
  { q: "What happens after I apply?", a: "We review your application, email you when you're approved, and then you can add photos, pricing and availability." },
  { q: "How are bookings handled?", a: "Guests send a request to book and our team confirms availability with you — there is no instant checkout." },
];

export default function HostPage() {
  return (
    <>
      <SplitHero
        kicker="Partner with Nestly"
        title="List your apartment with Nestly"
        text="Welcome vetted guests for month-plus stays. We approve every host manually before you can list."
        images={["/images/stock/furnished-interior.jpg", "/images/stock/nyc-apartment-living.jpg", "/images/stock/modern-workspace.jpg", "/images/stock/apartment-main.jpg"]}
        actions={
          <>
            <a href="#apply" className="btn btn-dark">Start your application</a>
            <Link href="/how-it-works" className="btn btn-outline !border-ink !text-ink">See how it works</Link>
          </>
        }
      />

      <Section>
        <Heading center kicker="Hosting, elevated" title="Quality guests, longer stays, less chaos" />
        <FeatureCards
          items={[
            { icon: "/images/icons/efforless-booking.png", title: "Longer stays", bullets: ["Guests booking 30+ days", "Not weekend turnovers", "Steadier occupancy"] },
            { icon: "/images/icons/curated-space.png", title: "Manual approval", bullets: ["We review every host", "Nestly stays trusted for guests", "Quality listings only"] },
            { icon: "/images/icons/neighborhood-access.png", title: "Simple tools", bullets: ["Manage listings after approval", "Photos, pricing and availability", "Requests come to you"] },
            { icon: "/images/icons/wifi-included.png", title: "Corporate & relocation guests", bullets: ["Business travelers and movers", "Clear expectations up front", "Personal booking support"] },
          ]}
        />
      </Section>

      <Section tone="soft">
        <Heading kicker="How hosting works" title="Create experiences, earn on your terms" text="Use your apartment, connect with amazing guests, and earn on your terms." />
        <ol className="grid gap-5 md:grid-cols-3">
          {hostSteps.map((h, i) => (
            <li key={h.title} className="flex items-center gap-5 rounded-3xl bg-white p-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-tint">
                <Image src={h.icon} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
              </span>
              <span>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">Step {i + 1}</span>
                <strong className="block font-serif text-lg font-medium">{h.title}</strong>
                <span className="text-[15px] text-muted">{h.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <div id="apply" className="mx-auto max-w-2xl scroll-mt-24">
          <Heading center title="Apply to host" text="Submit your application. We'll email you when you're approved to add listings." />
          <div className="rounded-3xl border border-line bg-white p-7 shadow-[0_10px_30px_rgba(23,24,25,.06)]">
            <InquiryForm
              type="host"
              submitLabel="Submit application"
              successText="We'll review your application and email you once you're approved."
              fields={[
                { name: "name", label: "Full name", required: true, half: true },
                { name: "email", label: "Email", type: "email", required: true, half: true },
                { name: "phone", label: "Phone", type: "tel", half: true },
                { name: "address", label: "Neighborhood / building", half: true },
                { name: "beds", label: "Bedrooms", options: ["Studio", "1", "2", "3+"], half: true },
                { name: "rent", label: "Expected monthly rent", half: true },
                { name: "message", label: "Tell us about your space", textarea: true },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section tone="soft">
        <Heading center title="Hosting FAQ" />
        <Faq items={faqs} />
      </Section>
    </>
  );
}
