"use client";

import Link from "next/link";
import { useMemo } from "react";
import { bookingValue, byId, nightsOf } from "@/lib/admin/calc";
import { TODAY, daysBetween, fmtShort, timeAgo } from "@/lib/admin/format";
import { useDB } from "@/lib/admin/store";
import { money as fmtMoney } from "@/lib/data";
import { Icon, type IconName } from "./icons";
import { PageHeader, StatusBadge } from "./ui";

const money = (n: number) => fmtMoney(Math.round(n));

export default function Dashboard() {
  const db = useDB();
  const listings = useMemo(() => byId(db.listings), [db.listings]);

  const newBookings = db.bookings.filter((b) => b.status === "new");
  const openInquiries = db.inquiries.filter((i) => i.status !== "resolved");
  const pendingHosts = db.hosts.filter((h) => h.status === "pending");
  const pendingReviews = db.reviews.filter((r) => r.status === "pending");
  const confirmed = db.bookings.filter((b) => b.status === "confirmed");
  const confirmedValue = confirmed.reduce((s, b) => s + bookingValue(b, listings.get(b.listingId)), 0);
  const live = db.listings.filter((l) => l.status === "published").length;

  const weeks = useMemo(() => {
    const bins = Array.from({ length: 8 }, (_, i) => ({ start: 7 * (7 - i), count: 0 }));
    for (const b of db.bookings) {
      const age = daysBetween(b.createdAt.slice(0, 10), TODAY);
      const bin = bins.find((x) => age >= x.start - 6 && age <= x.start);
      if (bin) bin.count++;
    }
    return bins.map((x) => ({
      label: fmtShort(new Date(Date.parse(TODAY) - x.start * 86_400_000).toISOString()),
      count: x.count,
    }));
  }, [db.bookings]);
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));

  const moveIns = confirmed
    .filter((b) => daysBetween(TODAY, b.checkIn) >= 0 && daysBetween(TODAY, b.checkIn) <= 30)
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn));

  const attention: { label: string; count: number; href: string; icon: IconName }[] = [
    { label: "New booking requests", count: newBookings.length, href: "/admin/bookings", icon: "calendar" },
    { label: "Unanswered inquiries", count: db.inquiries.filter((i) => i.status === "new").length, href: "/admin/inquiries", icon: "inbox" },
    { label: "Host applications to review", count: pendingHosts.length, href: "/admin/hosts", icon: "key" },
    { label: "Reviews awaiting moderation", count: pendingReviews.length, href: "/admin/reviews", icon: "star" },
  ];

  const stats: { label: string; value: string; sub: string; icon: IconName }[] = [
    { label: "New requests", value: String(newBookings.length), sub: `${db.bookings.length} bookings in total`, icon: "calendar" },
    { label: "Confirmed value", value: money(confirmedValue), sub: `${confirmed.length} confirmed stays`, icon: "trend" },
    { label: "Open inquiries", value: String(openInquiries.length), sub: "New or in progress", icon: "inbox" },
    { label: "Live listings", value: String(live), sub: `${db.listings.length - live} draft or archived`, icon: "building" },
  ];

  return (
    <>
      <PageHeader title="Dashboard" description="What needs your attention at Nestly today." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="a-card p-4 sm:p-5">
            <div className="flex items-center justify-between text-muted">
              <span>{s.label}</span>
              <Icon name={s.icon} size={18} />
            </div>
            <p className="mt-2 font-serif text-[28px] leading-none sm:text-[32px]">{s.value}</p>
            <p className="mt-2 text-[13px] text-muted">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="a-card p-5 lg:col-span-2" aria-labelledby="chart-h">
          <h2 id="chart-h" className="text-lg">Booking requests per week</h2>
          <p className="text-muted">Last 8 weeks, by week ending</p>
          <div className="mt-5 flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label={`Booking requests per week: ${weeks.map((w) => `${w.label} ${w.count}`).join(", ")}`}>
            {weeks.map((w, i) => (
              <div key={w.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-xs font-medium">{w.count || ""}</span>
                <div
                  className="w-full max-w-10 rounded-t-md bg-brand"
                  style={{ height: `${(w.count / maxWeek) * 100}%`, minHeight: w.count ? 4 : 2, opacity: w.count ? 1 : 0.2 }}
                />
                <span className={`whitespace-nowrap text-[10px] text-muted sm:text-[11px] ${i % 2 ? "invisible sm:visible" : ""}`}>{w.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="a-card p-5" aria-labelledby="attn-h">
          <h2 id="attn-h" className="text-lg">Needs attention</h2>
          <ul className="mt-3 flex flex-col">
            {attention.map((a) => (
              <li key={a.label}>
                <Link href={a.href} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-soft">
                  <span className={`grid h-9 w-9 place-items-center rounded-lg ${a.count ? "bg-brand-tint text-brand-dark" : "bg-soft text-muted"}`}>
                    <Icon name={a.icon} />
                  </span>
                  <span className="flex-1">{a.label}</span>
                  <span className={`font-semibold ${a.count ? "" : "text-muted"}`}>{a.count}</span>
                  <Icon name="chevron" size={16} className="text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="a-card" aria-labelledby="recent-h">
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 id="recent-h" className="text-lg">Latest booking requests</h2>
            <Link href="/admin/bookings" className="text-brand-dark hover:underline">View all</Link>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {[...db.bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((b) => (
              <li key={b.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{b.guestName}</p>
                  <p className="truncate text-muted">{listings.get(b.listingId)?.title ?? "Removed listing"}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={b.status} />
                  <span className="text-xs text-muted">{timeAgo(b.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="a-card" aria-labelledby="moves-h">
          <div className="px-5 pt-5">
            <h2 id="moves-h" className="text-lg">Upcoming move-ins</h2>
            <p className="text-muted">Confirmed stays starting in the next 30 days</p>
          </div>
          {moveIns.length ? (
            <ul className="mt-2 divide-y divide-line">
              {moveIns.map((b) => (
                <li key={b.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand-tint text-center text-brand-dark">
                    <span className="text-[11px] font-semibold uppercase leading-none">{fmtShort(b.checkIn).split(" ")[0]}</span>
                    <span className="-mt-3 text-base font-semibold">{fmtShort(b.checkIn).split(" ")[1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{b.guestName}</p>
                    <p className="truncate text-muted">{listings.get(b.listingId)?.title ?? "Removed listing"}</p>
                  </div>
                  <span className="text-muted">{nightsOf(b)} nights</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-muted">No confirmed move-ins coming up.</p>
          )}
        </section>
      </div>
    </>
  );
}
