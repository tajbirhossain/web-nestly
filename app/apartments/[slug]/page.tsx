import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AmenitiesList from "@/components/AmenitiesList";
import ApartmentCard from "@/components/ApartmentCard";
import BookingCard from "@/components/BookingCard";
import ExpandableText from "@/components/ExpandableText";
import Gallery from "@/components/Gallery";
import ListingActions from "@/components/ListingActions";
import MapView from "@/components/MapView";
import SectionNav from "@/components/SectionNav";
import { SqftIcon } from "@/components/ui/icons";
import { apartments, bedLabel, bedroomRows, features, getApartment, neighborhoods } from "@/lib/data";

export function generateStaticParams() {
  return apartments.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/apartments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const apt = getApartment(slug);
  return apt ? { title: apt.title, description: apt.about[0] } : {};
}

const nav = [
  { id: "photos", label: "Photos" },
  { id: "about", label: "About this home" },
  { id: "bedrooms", label: "The bedrooms" },
  { id: "offers", label: "What this home offers" },
  { id: "neighborhood", label: "Neighborhood" },
  { id: "similar", label: "Similar homes" },
  { id: "rules", label: "Booking & stay rules" },
];

const h2 = "text-[26px] leading-tight";
const section = "scroll-mt-36 border-b border-line py-10 last:border-0";

// Reading `params` must happen inside <Suspense> so the shared App Shell isn't tied to one URL.
export default function ApartmentPage({ params }: PageProps<"/apartments/[slug]">) {
  return (
    <Suspense fallback={<ApartmentSkeleton />}>
      <Apartment params={params} />
    </Suspense>
  );
}

function ApartmentSkeleton() {
  return (
    <div aria-hidden className="container-n animate-pulse pb-20 pt-[104px]">
      <div className="h-4 w-40 rounded bg-soft" />
      <div className="mt-4 h-10 w-2/3 rounded-xl bg-soft" />
      <div className="mt-8 h-[300px] rounded-3xl bg-soft md:h-[440px]" />
    </div>
  );
}

async function Apartment({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const apt = getApartment(slug);
  if (!apt) notFound();

  const similar = apartments.filter((a) => a.slug !== apt.slug).slice(0, 3);
  const hood = neighborhoods.find((n) => n.name === apt.neighborhood);

  return (
    <div className="pt-[72px]">
      <div id="photos" className="container-n pb-8 pt-8">
        <Link href={`/apartments?area=${encodeURIComponent(apt.borough)}`} className="text-sm text-muted underline underline-offset-4 hover:text-ink">
          {apt.neighborhood}, New York
        </Link>
        <h1 className="mt-2 text-[clamp(28px,4vw,40px)] leading-[1.1]">{apt.title}</h1>
        <div className="mb-5 mt-3 flex flex-wrap items-center justify-between gap-3">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-muted">
            <li>{bedLabel(apt.beds)}</li>
            <li aria-hidden>·</li>
            <li>{apt.baths} Bath{apt.baths > 1 ? "s" : ""}</li>
            <li aria-hidden>·</li>
            <li className="flex items-center gap-1.5"><SqftIcon />{apt.sqft.toLocaleString()} ft²</li>
            {apt.address && (<><li aria-hidden>·</li><li>{apt.address}</li></>)}
          </ul>
          <ListingActions slug={apt.slug} title={apt.title} />
        </div>
        <Gallery images={apt.images} title={apt.title} />
      </div>

      <SectionNav items={nav} />

      <div className="container-n grid gap-12 pb-20 lg:grid-cols-[1fr_380px]">
        <div>
          <section className="scroll-mt-36 border-b border-line py-8">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-tint font-serif text-lg text-brand">N</span>
              <div>
                <p className="font-medium">Managed by Nestly</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">
                  From booking through move-out, we&apos;ve got you covered — personal confirmation of your stay and 24/7 app support.
                </p>
              </div>
            </div>
          </section>

          <section id="about" className={section}>
            <h2 className={`${h2} mb-5`}>About this home</h2>
            <ExpandableText paragraphs={apt.about} />
            {apt.highlights && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {apt.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-[15px] text-muted"><span aria-hidden className="text-brand">✓</span>{h}</li>
                ))}
              </ul>
            )}
          </section>

          <section id="bedrooms" className={section}>
            <h2 className={`${h2} mb-6`}>The bedrooms</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {bedroomRows(apt).map((b) => (
                <div key={b.name}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-soft">
                    <Image src={b.photo} alt={`${b.name} with ${b.bed.toLowerCase()}`} fill sizes="(min-width:640px) 25vw, 100vw" className="object-cover" />
                  </div>
                  <p className="mt-3 font-medium">{b.name}</p>
                  <p className="text-sm text-muted">{b.bed}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="offers" className={section}>
            <h2 className={`${h2} mb-5`}>What this home offers</h2>
            <AmenitiesList items={apt.amenities} />
            <div className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#f1f1ff] to-[#f8f8ff] p-7">
              <p className="font-serif text-xl text-[#4b4b8f]">Your stay with Nestly</p>
              <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted">
                Our homes come fully furnished and move-in ready, with a fully equipped kitchen, fast Wi‑Fi, and utilities set up. Professionally cleaned before you arrive, with fresh linens and 24/7 app support.
              </p>
              <ul className="mt-5 flex flex-wrap gap-6">
                {features.map((f) => (
                  <li key={f.title} className="flex items-center gap-2 text-sm text-[#4b4b8f]">
                    <Image src={f.icon} alt="" width={36} height={36} className="h-9 w-9 object-contain" />
                    {f.title}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="neighborhood" className={section}>
            <h2 className={`${h2} mb-2`}>About the neighborhood</h2>
            <p className="mb-5 text-[15px] text-muted">
              <strong className="font-medium text-ink">{apt.neighborhood}, {apt.borough}.</strong> {hood?.blurb}
            </p>
            <div className="h-[320px] overflow-hidden rounded-3xl border border-line">
              <MapView pins={[{ slug: apt.slug, title: apt.title, price: apt.price, lat: apt.lat, lng: apt.lng }]} activeSlug={apt.slug} zoom={14} interactive={false} className="h-full w-full" />
            </div>
            <p className="mt-2 text-xs text-muted">Approximate location. The exact address is shared when your stay is confirmed.</p>
          </section>

          <section id="similar" className={section}>
            <h2 className={`${h2} mb-6`}>Similar homes</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {similar.slice(0, 2).map((a) => (
                <ApartmentCard key={a.slug} apt={a} />
              ))}
            </div>
          </section>

          <section id="rules" className={section}>
            <h2 className={`${h2} mb-5`}>Booking &amp; stay rules</h2>
            <dl className="grid gap-5 sm:grid-cols-2">
              {[
                ["Minimum stay", "30 nights. Longer stays are welcome."],
                ["How booking works", "Pick your dates and send a request. Nestly confirms availability personally — no instant checkout."],
                ["Included", "Utilities and Wi‑Fi are typically included. We confirm details when we follow up."],
                ["Move-in", "Furnished, professionally cleaned, with linens and kitchen essentials ready."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-line p-5">
                  <dt className="font-medium">{t}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed text-muted">{d}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <aside className="pt-8 lg:sticky lg:top-40 lg:self-start">
          <BookingCard slug={apt.slug} title={apt.title} price={apt.price} availableFrom={apt.availableFrom} />
        </aside>
      </div>
    </div>
  );
}
