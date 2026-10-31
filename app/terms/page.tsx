import type { Metadata } from "next";
import { PageHero, Prose, Section } from "@/components/sections";

export const metadata: Metadata = { title: "Terms of Service" };

// TODO: replace with legally reviewed copy from the client.
export default function TermsPage() {
  return (
    <>
      <PageHero kicker="Legal" title="Terms of Service" image="/images/stock/nyc-skyline-apt.jpg" />
      <Section>
        <Prose>
          <p>These terms govern your use of the Nestly website and booking requests.</p>
          <h2>Stays</h2>
          <p>All Nestly stays have a minimum duration of 30 days. Submitting a request does not guarantee availability; a booking is only confirmed once the Nestly team contacts you.</p>
          <h2>Hosts</h2>
          <p>Hosts are reviewed and approved manually. Nestly may decline or remove listings at its discretion.</p>
          <h2>Contact</h2>
          <p>Questions about these terms can be sent to hello@nestly.nyc.</p>
        </Prose>
      </Section>
    </>
  );
}
