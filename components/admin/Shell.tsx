"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { signOut, useDB, useDBStatus, useSession } from "@/lib/admin/store";
import { FeedbackProvider } from "./feedback";
import { Icon, type IconName } from "./icons";

type NavItem = { href: string; label: string; icon: IconName; badge?: number };

/** Redirects to /admin/login when there is no session, then renders the panel shell. */
export default function Shell({ children }: { children: ReactNode }) {
  const session = useSession();
  const router = useRouter();
  const { ready } = useDBStatus();

  useEffect(() => {
    if (session === false) router.replace("/admin/login");
  }, [session, router]);

  if (!session || !ready) {
    return (
      <div className="grid min-h-screen place-items-center text-muted" role="status">
        Loading…
      </div>
    );
  }
  return (
    <FeedbackProvider>
      <Frame>{children}</Frame>
    </FeedbackProvider>
  );
}

function Frame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const db = useDB();
  const status = useDBStatus();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  // Close the mobile menu after navigating (state adjusted during render, per React docs).
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const groups: { title: string; items: NavItem[] }[] = [
    {
      title: "Overview",
      items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" }],
    },
    {
      title: "Operations",
      items: [
        { href: "/admin/bookings", label: "Bookings", icon: "calendar", badge: db.bookings.filter((b) => b.status === "new").length },
        { href: "/admin/inquiries", label: "Inquiries", icon: "inbox", badge: db.inquiries.filter((i) => i.status === "new").length },
        { href: "/admin/hosts", label: "Host applications", icon: "key", badge: db.hosts.filter((h) => h.status === "pending").length },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/listings", label: "Listings", icon: "building" },
        { href: "/admin/reviews", label: "Reviews", icon: "star", badge: db.reviews.filter((r) => r.status === "pending").length },
        { href: "/admin/blog", label: "Blog", icon: "doc" },
      ],
    },
    {
      title: "System",
      items: [{ href: "/admin/settings", label: "Settings", icon: "settings" }],
    },
  ];

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Admin" className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-4">
      {groups.map((g) => (
        <div key={g.title}>
          <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted/80">{g.title}</p>
          <ul className="flex flex-col gap-0.5">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="a-nav" aria-current={isActive(it.href) ? "page" : undefined}>
                  <Icon name={it.icon} />
                  <span className="flex-1">{it.label}</span>
                  {!!it.badge && (
                    <span className="grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-semibold leading-5 text-white">
                      {it.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/admin" className="flex items-center gap-2.5 px-5 py-4" aria-label="Nestly admin home">
      <Image src="/images/brand/logo.png" alt="Nestly" width={110} height={32} className="h-7 w-auto" priority />
      <span className="rounded-md bg-brand-tint px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-dark">Admin</span>
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white lg:flex">
        {brand}
        {nav}
        <SidebarFooter />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="a-anim-fade absolute inset-0 bg-[rgba(23,24,25,.45)]" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="a-anim-slide absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-2xl">
            {brand}
            {nav}
            <SidebarFooter />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-white/90 px-4 backdrop-blur sm:px-6">
          <button type="button" className="a-btn a-btn-ghost a-btn-sm lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            <Icon name="menu" size={20} />
          </button>
          <div className="flex-1" />
          <span
            className="hidden items-center gap-1.5 text-xs text-muted sm:inline-flex"
            title={status.remote ? "Edits are saved to the Neon database" : "No DATABASE_URL set — edits are saved in this browser only"}
          >
            <span className={`h-2 w-2 rounded-full ${status.error ? "bg-bad" : status.remote ? "bg-ok" : "bg-warn"}`} />
            {status.remote ? "Neon database" : "Local demo data"}
          </span>
          <Link href="/" target="_blank" className="a-btn a-btn-ghost a-btn-sm">
            View site <Icon name="external" size={14} />
          </Link>
          <button
            type="button"
            className="a-btn a-btn-outline a-btn-sm"
            onClick={() => {
              signOut();
              router.replace("/admin/login");
            }}
          >
            <Icon name="logout" size={15} /> Sign out
          </button>
        </header>
        {status.error && (
          <div role="alert" className="border-b border-line bg-bad-tint px-4 py-2.5 text-sm text-bad sm:px-6">
            Couldn’t sync with the database: {status.error}. Check DATABASE_URL and that `npm run db:setup` has been run.
          </div>
        )}
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-line p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-semibold text-white">N</span>
        <div className="min-w-0">
          <p className="truncate font-medium">Nestly Admin</p>
          <p className="truncate text-xs text-muted">admin@nestly.nyc</p>
        </div>
      </div>
    </div>
  );
}
