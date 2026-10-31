import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero, Section } from "@/components/sections";
import { reviews } from "@/lib/data";

export const metadata: Metadata = {
  title: "Guest reviews",
  description: "Hear from guests who chose Nestly for month-plus living in New York.",
};

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        kicker="Guest voices"
        title="Real stays. Real feedback."
        text="Hear from guests who chose Nestly for month-plus living in New York."
        image="/images/stock/nyc-apartment-living.jpg"
        actions={<Link href="/apartments" className="btn btn-primary">Browse apartments</Link>}
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <figure key={r.name} className="rounded-3xl border border-line p-7">
              <div aria-label="5 out of 5 stars" className="text-brand">★★★★★</div>
              <blockquote className="mt-4 leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
              <figcaption className="mt-5 text-sm"><strong className="font-medium">{r.name}</strong><span className="text-muted"> · {r.role}</span></figcaption>
            </figure>
          ))}
        </div>
        {/* TODO: replace with a real reviews source + submission form (WP used the Site Reviews plugin). */}
      </Section>
      <CtaBand title="Ready for your own Nestly stay?" text="Explore apartments available for 30+ days." href="/apartments" label="See apartments" />
    </>
  );
}
