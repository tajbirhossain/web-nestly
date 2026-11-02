import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ApartmentsExplorer from "@/components/ApartmentsExplorer";
import { CtaBand } from "@/components/sections";
import { getApartments } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Furnished apartments in NYC",
  description: "Browse curated furnished apartments across Manhattan, the Bronx, Brooklyn and New Jersey for 30+ day stays.",
};

async function Explorer() {
  return (
    <ApartmentsExplorer apartments={await getApartments()}>
      <h1 className="text-[clamp(26px,3vw,34px)] leading-tight">Furnished apartments for rent in New York City</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        <strong className="font-medium text-ink">Monthly and longer stays across Manhattan, the Bronx, Brooklyn and New Jersey.</strong> Every Nestly home is move-in ready — furnished, professionally cleaned, with utilities and Wi‑Fi set up. Request to book and we confirm availability personally.{" "}
        <Link href="/how-it-works" className="text-brand underline underline-offset-4">How it works</Link>
      </p>
    </ApartmentsExplorer>
  );
}

export default function ApartmentsPage() {
  return (
    <div className="pt-[72px]">
      <Suspense fallback={<p className="py-40 text-center text-muted">Loading apartments…</p>}>
        <Explorer />
      </Suspense>
      <CtaBand
        title="Not sure which apartment fits?"
        text="Tell us your dates and neighborhood preferences — we'll recommend options."
        href="/contact"
        label="Get a free quote"
      />
    </div>
  );
}
