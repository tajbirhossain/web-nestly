import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";
import { getSettings } from "@/lib/settings";

const cols = [
  {
    title: "Guests",
    links: [
      ["Apartments", "/apartments"],
      ["Neighborhoods", "/neighborhoods"],
      ["How it works", "/how-it-works"],
      ["Reviews", "/reviews"],
    ],
  },
  {
    title: "Stays for",
    links: [
      ["Corporate housing", "/corporate"],
      ["Relocation", "/relocation"],
      ["Remote work", "/about"],
    ],
  },
  {
    title: "Hosts",
    links: [
      ["Become a host", "/become-a-host"],
      ["How hosting works", "/how-it-works"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Blog", "/blog"],
      ["FAQ", "/faq"],
      ["Contact", "/contact"],
    ],
  },
];

export default async function Footer() {
  const { supportEmail, phone } = await getSettings();
  return (
    <footer className="bg-ink text-white">
      <div className="container-n grid gap-12 py-16 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Image src="/images/brand/logo-white.png" alt="Nestly" width={110} height={32} className="h-8 w-auto" style={{ width: "auto", height: 32 }} />
          <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-white/70">
            Furnished, move-in ready apartments across New York City for stays of 30 days or longer.
          </p>
          <a href={`mailto:${supportEmail}`} className="mt-5 inline-block text-[15px] underline underline-offset-4 hover:text-white/80">
            {supportEmail}
          </a>
          {phone && (
            <a href={`tel:${phone.replace(/[^+d]/g, "")}`} className="mt-2 block text-[15px] text-white/80 hover:text-white">
              {phone}
            </a>
          )}
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="!font-sans text-xs font-semibold uppercase tracking-[0.18em] text-white/50">{c.title}</h2>
            <ul className="mt-5 space-y-3">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-[15px] text-white/80 hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-n flex flex-col items-start justify-between gap-6 py-8 md:flex-row md:items-center">
          <p className="max-w-md text-[15px] leading-relaxed text-white/80">
            <strong className="font-medium text-white">Get new apartments first.</strong> Sign up for alerts on newly available homes and exclusive offers.
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-n flex flex-col gap-3 py-6 text-sm text-white/55 sm:flex-row sm:justify-between">
          <p>© 2026 Nestly. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
