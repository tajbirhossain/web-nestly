import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero, Section } from "@/components/sections";
import { posts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Guides for living, working and relocating in New York City.",
};

export default function BlogPage() {
  return (
    <>
      <PageHero kicker="The Nestly blog" title="Guides for living in New York" image="/images/stock/nyc-neighborhood.jpg" />
      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image src={p.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-4 text-[13px] font-medium text-brand">{p.category}</p>
              <h2 className="mt-1 text-xl leading-snug group-hover:underline">{p.title}</h2>
              <p className="mt-2 text-[15px] text-muted">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
