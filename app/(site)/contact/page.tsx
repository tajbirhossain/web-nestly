import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";
import { PageHero, Section } from "@/components/sections";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: "Booking requests, corporate housing, relocation, or hosting — send a note and we'll get back to you.",
};

const links = [
  ["Corporate", "Team housing & quotes", "/corporate"],
  ["Relocation", "Soft landings in NYC", "/relocation"],
  ["Hosting", "List your apartment", "/become-a-host"],
  ["FAQ", "Quick answers", "/faq"],
];

export default async function ContactPage() {
  const { supportEmail, phone } = await getSettings();
  return (
    <>
      <PageHero
        kicker="We're here"
        title="Contact Nestly"
        text="Booking requests, corporate housing, relocation, or hosting — send a note and we'll get back to you."
        image="/images/stock/nyc-skyline-apt.jpg"
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
          <div>
            <h2 className="text-3xl">Send a message</h2>
            <p className="mb-6 mt-2 text-muted">Tell us dates, neighborhood preferences, and how we can help.</p>
            <InquiryForm
              type="contact"
              fields={[
                { name: "name", label: "Name", required: true, half: true },
                { name: "email", label: "Email", type: "email", required: true, half: true },
                { name: "phone", label: "Phone", type: "tel", half: true },
                { name: "topic", label: "Topic", options: ["Booking", "Corporate", "Relocation", "Hosting", "Other"], half: true },
                { name: "message", label: "Message", textarea: true, required: true },
              ]}
            />
          </div>
          <aside className="space-y-4">
            <div className="rounded-3xl bg-ink p-7 text-white">
              <p className="text-sm text-white/60">Email</p>
              <a href={`mailto:${supportEmail}`} className="text-xl underline underline-offset-4">{supportEmail}</a>
              {phone && (
                <>
                  <p className="mt-6 text-sm text-white/60">Phone</p>
                  <a href={`tel:${phone.replace(/[^+d]/g, "")}`} className="text-xl underline underline-offset-4">{phone}</a>
                </>
              )}
              <p className="mt-6 text-sm text-white/60">Based in</p>
              <p>New York, NY</p>
            </div>
            {links.map(([t, d, h]) => (
              <Link key={t} href={h} className="block rounded-2xl border border-line p-5 transition hover:border-brand">
                <strong className="font-serif text-lg font-medium">{t}</strong>
                <span className="block text-sm text-muted">{d}</span>
              </Link>
            ))}
          </aside>
        </div>
      </Section>
    </>
  );
}
