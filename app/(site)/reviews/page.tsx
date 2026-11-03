import type { Metadata } from "next";
import Link from "next/link";
import ReviewForm from "@/components/ReviewForm";
import { CtaBand, PageHero, Section } from "@/components/sections";
import { getApartments } from "@/lib/listings";
import { getReviews } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Guest reviews",
  description: "Hear from guests who chose Nestly for month-plus living in New York.",
};

export default async function ReviewsPage() {
  const [reviews, apartments] = await Promise.all([getReviews(), getApartments()]);
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
            <figure key={`${r.name}-${r.text.slice(0, 12)}`} className="rounded-3xl border border-line p-7">
              <div role="img" aria-label={`${r.rating} out of 5 stars`} className="text-brand">{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span></div>
              <blockquote className="mt-4 leading-relaxed">&ldquo;{r.text}&rdquo;</blockquote>
              <figcaption className="mt-5 text-sm"><strong className="font-medium">{r.name}</strong><span className="text-muted"> · {r.role}</span>{r.verified && <span className="ml-2 rounded-full bg-brand-tint px-2 py-0.5 text-xs font-medium text-brand">Verified stay</span>}</figcaption>
            </figure>
          ))}
        </div>
      </Section>
      <Section tone="soft">
        <div className="mx-auto max-w-2xl">
          <ReviewForm homes={apartments.map((a) => ({ slug: a.slug, title: a.title }))} />
        </div>
      </Section>
      <CtaBand title="Ready for your own Nestly stay?" text="Explore apartments available for 30+ days." href="/apartments" label="See apartments" />
    </>
  );
}
