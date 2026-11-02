import Image from "next/image";
import Link from "next/link";
import ApartmentCard from "@/components/ApartmentCard";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import SearchBar from "@/components/SearchBar";
import { CtaBand, Heading, Section } from "@/components/sections";
import { getApartments } from "@/lib/listings";
import { features, hostSteps, lifestyles, logos, neighborhoods, posts, reviews, steps } from "@/lib/data";

const stories = [
  { title: "New city, zero stress with Nestly", by: "Guest, Marcus K.", image: "/images/stock/story1.jpg" },
  { title: "A corporate stay that felt like home", by: "Client, David Vance", image: "/images/stock/story2.jpg" },
  { title: "Making space for what matters most", by: "Guest, Elena Rostova", image: "/images/stock/story3.jpg" },
];

export default async function Home() {
  const apartments = await getApartments();
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-center bg-ink pb-24 pt-32 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image src="/images/stock/nyc-hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/35 to-ink/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/30" />
        </div>
        <div className="container-n relative">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
            Furnished stays · 30+ days · New York City
          </p>
          <h1 className="max-w-4xl leading-[1.02]">
            <span className="block text-[clamp(26px,3.6vw,44px)] text-white/90">Your NYC Gateway to</span>
            <span className="block text-[clamp(44px,8vw,92px)]">Comfort &amp; Convenience</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
            Beautifully furnished apartments with utilities set up and high-speed Wi‑Fi running. Request a stay and we confirm it personally.
          </p>
          <div className="mt-10">
            <SearchBar />
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/90">
            <li>✓ No hidden hotel fees</li>
            <li>✓ Professionally cleaned</li>
            <li>✓ Personal booking support</li>
          </ul>
        </div>
      </section>

      {/* The Nestly Experience */}
      <section className="bg-white pt-16 md:pt-24">
        <div className="container-n">
          <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="kicker mb-4">The Nestly Experience</p>
              <h2 className="text-[clamp(30px,4vw,46px)] leading-[1.1]">Land in New York and settle in instantly</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-muted">
                Nestly offers beautifully furnished apartments with utilities set up, high-speed Wi‑Fi running, and a fully equipped kitchen ready for use. Enjoy professionally cleaned spaces, fresh linens, and 24/7 app support at your fingertips. Your effortless NYC chapter starts here.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
                {[
                  ["30+", "night stays"],
                  ["24/7", "app support"],
                  ["Wi‑Fi", "set up for you"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dt className="font-serif text-2xl text-brand md:text-3xl">{v}</dt>
                    <dd className="mt-1 text-sm text-muted">{l}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <li
                  key={f.title}
                  className="group rounded-3xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(23,24,25,.04)] transition duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_18px_40px_rgba(92,92,255,.12)]"
                >
                  <span className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#f3f3ff] to-[#e4e4ff] transition group-hover:from-[#ececff] group-hover:to-[#d9d9ff]">
                    <Image src={f.icon} alt="" width={128} height={128} className="h-12 w-12 object-contain" />
                  </span>
                  <h3 className="mt-5 text-lg leading-snug">{f.title}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#3d3de0] via-brand to-[#8a8aff] p-8 text-white md:p-10">
            <span aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 font-serif text-xl font-medium ring-1 ring-white/30 backdrop-blur" aria-hidden>
                  20%
                </span>
                <div>
                  <p className="font-serif text-[clamp(22px,3vw,30px)] leading-tight">Book Direct &amp; Save Up to 20%!</p>
                  <p className="mt-1.5 max-w-xl text-[15px] leading-relaxed text-white/85">
                    Avoid third-party booking platform fees, and book directly with us to enjoy better rates.
                  </p>
                </div>
              </div>
              <Link href="/apartments" className="btn shrink-0 bg-white !text-ink hover:bg-soft">
                Find your home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Listings */}
      <Section>
        <Heading kicker="Top selections" title="Top housing list in New York" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {apartments.slice(0, 3).map((a) => (
            <ApartmentCard key={a.slug} apt={a} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/apartments" className="btn btn-primary">See more</Link>
        </div>
      </Section>

      {/* Reviews */}
      <Section tone="soft">
        <Heading center kicker="Guest voices" title="Reviews from our recent customers" />
        <ReviewsCarousel items={reviews} />
      </Section>

      {/* Real stories */}
      <section className="bg-white">
        <h2 className="py-14 text-center text-[clamp(28px,4vw,40px)]">Real stories, real people</h2>
        <div className="grid md:grid-cols-3">
          {stories.map((s) => (
            <figure key={s.title} className="relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
              <Image src={s.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-7 text-white">
                <p className="font-serif text-2xl leading-snug">{s.title}</p>
                <p className="mt-1 text-sm text-white/80">{s.by}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Trusted by */}
      <section className="border-b border-line bg-white py-14">
        <div className="container-n">
          <p className="mb-8 text-center font-serif text-2xl">Trusted by 2,500+ companies</p>
          <ul className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            {logos.map((l) => (
              <li key={l.name}>
                <Image src={l.src} alt={l.name} width={110} height={36} className="h-8 w-auto opacity-60 grayscale" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lifestyle */}
      <Section>
        <Heading kicker="Stays tailored to your lifestyle" title="Whatever brings you to New York" />
        <div className="grid gap-6 md:grid-cols-3">
          {lifestyles.map((l) => (
            <Link key={l.title} href={l.href} className="group block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image src={l.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="kicker mt-5">{l.kicker}</p>
              <h3 className="mt-2 text-2xl leading-snug">{l.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{l.text}</p>
              <span className="mt-4 inline-block text-sm font-medium text-brand">Learn more →</span>
            </Link>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section tone="soft">
        <Heading kicker="Simple by design" title="From search to settled in, in four steps" />
        <ol className="grid gap-8 md:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="border-t-2 border-ink pt-5">
              <span className="font-serif text-3xl text-brand">{s.n}</span>
              <h3 className="mt-3 text-xl">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Neighborhoods */}
      <Section tone="dark">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <Heading kicker="Explore the city" title="Neighborhoods made for living" />
          <Link href="/neighborhoods" className="btn btn-ghost mb-12">All neighborhoods</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {neighborhoods.slice(0, 4).map((n) => (
            <Link
              key={n.name}
              href={`/apartments?area=${encodeURIComponent(n.borough)}`}
              className="group relative block aspect-[3/4] overflow-hidden rounded-3xl"
            >
              <Image src={n.image} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs uppercase tracking-widest text-white/70">{n.borough}</p>
                <h3 className="text-2xl">{n.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Become a host */}
      <Section>
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Heading kicker="Hosts" title="Become a host, create experiences" text="Use your apartment, connect with amazing guests, and earn on your terms." />
            <Link href="/become-a-host" className="btn btn-primary -mt-4">Become a host</Link>
          </div>
          <ul className="grid gap-4">
            {hostSteps.map((h) => (
              <li key={h.title} className="flex items-center gap-5 rounded-3xl bg-soft p-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white">
                  <Image src={h.icon} alt="" width={96} height={96} className="h-9 w-9 object-contain" />
                </span>
                <span>
                  <strong className="block font-serif text-lg font-medium">{h.title}</strong>
                  <span className="text-[15px] text-muted">{h.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Blog */}
      <Section tone="soft">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <Heading kicker="From the blog" title="Guides for living in New York" />
          <Link href="/blog" className="btn btn-outline mb-12">Read the blog</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image src={p.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="mt-4 text-[13px] font-medium text-brand">{p.category}</p>
              <h3 className="mt-1 text-xl leading-snug group-hover:underline">{p.title}</h3>
              <p className="mt-2 text-[15px] text-muted">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Ready for your own Nestly stay?"
        text="Browse apartments available for 30+ days, or tell us what you need and we'll match you."
        href="/apartments"
        label="See apartments"
      />
    </>
  );
}
