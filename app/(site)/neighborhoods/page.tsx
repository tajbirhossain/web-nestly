import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaBand, Heading, PageHero, Section } from "@/components/sections";
import { buildNeighborhoods } from "@/lib/catalog";
import { boroughs, money } from "@/lib/data";
import { getApartments } from "@/lib/listings";

export const metadata: Metadata = {
  title: "NYC neighborhoods",
  description: "Choose Nestly apartments by area — Upper East Side to New Jersey.",
};

export default async function NeighborhoodsPage() {
  const apartments = await getApartments();
  const neighborhoods = buildNeighborhoods(apartments);
  return (
    <>
      <PageHero
        kicker="Explore the city"
        title="Neighborhoods made for living"
        text="Choose Nestly apartments by area — from the Upper East Side to New Jersey."
        image="/images/stock/nyc-neighborhood.jpg"
        actions={<Link href="/apartments" className="btn btn-primary">See all apartments</Link>}
      />
      {boroughs.map((b, i) => (
        <Section key={b} tone={i ? "soft" : "white"}>
          <Heading title={b} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {neighborhoods
              .filter((n) => n.borough === b)
              .map((n) => {
                const homes = apartments.filter((a) => a.neighborhood === n.name);
                const from = homes.length ? Math.min(...homes.map((h) => h.price)) : 0;
                return (
                  <Link
                    key={n.name}
                    href={`/apartments?area=${encodeURIComponent(n.borough)}`}
                    className="group overflow-hidden rounded-3xl border border-line bg-white p-2 transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                      <Image src={n.image} alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium">
                        {homes.length ? `${homes.length} home${homes.length > 1 ? "s" : ""}` : "Coming soon"}
                      </span>
                    </div>
                    <div className="px-4 pb-4 pt-5">
                      <h3 className="text-xl">{n.name}</h3>
                      <p className="mt-1.5 text-[15px] text-muted">{n.blurb}</p>
                      <p className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-muted">{from ? <>from <strong className="font-medium text-ink">{money(from)}</strong>/mo</> : "Be first to know"}</span>
                        <span className="font-medium text-brand">Browse homes →</span>
                      </p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </Section>
      ))}
      <CtaBand title="Need a neighborhood match?" text="Tell us how you live and work — we'll suggest the right side of town." href="/contact" label="Contact Nestly" />
    </>
  );
}
