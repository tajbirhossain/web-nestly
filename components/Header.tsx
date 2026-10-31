"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const nav = [
  { href: "/apartments", label: "Apartments" },
  { href: "/neighborhoods", label: "Neighborhoods" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/corporate", label: "Corporate" },
  { href: "/become-a-host", label: "Become a host" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const overHero = pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        overHero ? "bg-transparent text-white" : "bg-white/95 text-ink shadow-[0_1px_0_var(--line)] backdrop-blur"
      }`}
    >
      <div className={`${pathname === "/apartments" ? "px-4 lg:px-6" : "container-n"} flex h-[72px] items-center justify-between gap-6`}>
        <Link href="/" aria-label="Nestly home" className="shrink-0">
          <Image
            src={overHero ? "/images/brand/logo-white.png" : "/images/brand/logo.png"}
            alt="Nestly"
            width={110}
            height={32}
            priority
            className="h-8 w-auto" style={{ width: "auto", height: 32 }}
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={pathname.startsWith(n.href) ? "page" : undefined}
              className={`text-[15px] font-medium transition-opacity hover:opacity-70 ${
                pathname.startsWith(n.href) ? "underline decoration-brand decoration-2 underline-offset-8" : ""
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/contact" className="text-[15px] font-medium hover:opacity-70">
            Contact
          </Link>
          <Link href="/apartments" className="btn btn-primary !min-h-11 !px-6">
            Find a home
          </Link>
        </div>

        <button
          type="button"
          className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-line bg-white text-ink lg:hidden">
          <div className="container-n flex flex-col py-4">
            {[...nav, { href: "/contact", label: "Contact" }].map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="border-b border-line py-4 text-lg font-medium">
                {n.label}
              </Link>
            ))}
            <Link href="/apartments" onClick={() => setOpen(false)} className="btn btn-primary mt-5">
              Find a home
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
