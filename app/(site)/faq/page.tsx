import type { Metadata } from "next";
import Link from "next/link";
import Faq from "@/components/Faq";
import { PageHero, Section } from "@/components/sections";
import { faqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Stays, booking requests, hosting, and what to expect with Nestly.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        kicker="Help center"
        title="Questions, answered clearly"
        text="Stays, booking requests, hosting, and what to expect with Nestly."
        image="/images/stock/nyc-neighborhood.jpg"
        actions={<Link href="/contact" className="btn btn-primary">Contact us</Link>}
      />
      <Section>
        <Faq items={faqs} />
        <div className="mx-auto mt-12 max-w-3xl rounded-3xl bg-soft p-8 text-center">
          <h2 className="text-2xl">Still need a human?</h2>
          <p className="mt-2 text-muted">We&apos;re here for booking questions, corporate stays, and hosting.</p>
          <Link href="/contact" className="btn btn-primary mt-5">Message Nestly</Link>
        </div>
      </Section>
    </>
  );
}
