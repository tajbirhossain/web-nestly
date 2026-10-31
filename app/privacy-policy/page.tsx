import type { Metadata } from "next";
import { PageHero, Prose, Section } from "@/components/sections";

export const metadata: Metadata = { title: "Privacy Policy" };

// TODO: replace with legally reviewed copy from the client.
export default function PrivacyPage() {
  return (
    <>
      <PageHero kicker="Legal" title="Privacy Policy" image="/images/stock/nyc-skyline-apt.jpg" />
      <Section>
        <Prose>
          <p>Nestly collects only the information you submit through our forms — such as your name, email, phone number, and stay preferences — to respond to your request.</p>
          <h2>How we use it</h2>
          <p>We use your details to confirm bookings, answer questions, and review host applications. We do not sell personal information.</p>
          <h2>Contact</h2>
          <p>To ask about or delete your data, email hello@nestly.nyc.</p>
        </Prose>
      </Section>
    </>
  );
}
