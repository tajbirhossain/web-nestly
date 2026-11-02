"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { bookingIssues, bookingValue, byId, guestSummary, matches, nightsOf } from "@/lib/admin/calc";
import { fmtDate, timeAgo } from "@/lib/admin/format";
import { actions, useDB } from "@/lib/admin/store";
import type { Booking, BookingStatus } from "@/lib/admin/types";
import { money } from "@/lib/data";
import { useFeedback } from "./feedback";
import { Icon } from "./icons";
import { EmptyState, Overlay, PageHeader, SearchBox, Segmented, StatusBadge } from "./ui";

const filters: (BookingStatus | "all")[] = ["all", "new", "contacted", "confirmed", "declined", "cancelled"];

export default function Bookings() {
  const db = useDB();
  const { toast, confirm } = useFeedback();
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const listings = useMemo(() => byId(db.listings), [db.listings]);

  const rows = useMemo(
    () =>
      db.bookings
        .filter((b) => (status === "all" || b.status === status) && matches(q, b.guestName, b.email, listings.get(b.listingId)?.title))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.bookings, status, q, listings],
  );
  const open = db.bookings.find((b) => b.id === openId);

  async function setBookingStatus(b: Booking, next: BookingStatus) {
    if ((next === "declined" || next === "cancelled") && !(await confirm({
      title: `Mark as ${next}?`,
      text: `${b.guestName}'s request will be marked ${next}. You can change this later.`,
      confirmLabel: `Mark ${next}`,
      danger: true,
    }))) return;
    actions.patch("bookings", b.id, { status: next });
    toast(`Booking marked ${next}`);
  }

  async function remove(b: Booking) {
    if (!(await confirm({ title: "Delete this booking?", text: "This permanently removes the request.", confirmLabel: "Delete", danger: true }))) return;
    actions.remove("bookings", b.id);
    setOpenId(null);
    toast("Booking deleted");
  }

  return (
    <>
      <PageHeader title="Bookings" description="Review stay requests, follow up with guests and confirm availability." />

      <div className="a-card">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={filters.map((f) => ({
              value: f,
              label: f === "all" ? "All" : f[0].toUpperCase() + f.slice(1),
              count: f === "all" ? db.bookings.length : db.bookings.filter((b) => b.status === f).length,
            }))}
          />
          <SearchBox value={q} onChange={setQ} placeholder="Search guest or apartment" />
        </div>

        {rows.length ? (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th className="hidden md:table-cell">Apartment</th>
                  <th>Stay</th>
                  <th>Status</th>
                  <th className="hidden lg:table-cell">Received</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr
                    key={b.id}
                    className="is-click"
                    tabIndex={0}
                    onClick={() => setOpenId(b.id)}
                    onKeyDown={(e) => e.key === "Enter" && setOpenId(b.id)}
                  >
                    <td>
                      <p className="font-medium">{b.guestName}</p>
                      <p className="text-muted">{b.email}</p>
                      <p className="mt-0.5 max-w-[220px] truncate text-[13px] md:hidden">{listings.get(b.listingId)?.title ?? "Removed listing"}</p>
                    </td>
                    <td className="hidden max-w-[260px] truncate md:table-cell">{listings.get(b.listingId)?.title ?? <span className="text-muted">Removed listing</span>}</td>
                    <td className="whitespace-nowrap">
                      {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}
                      <p className="text-muted">{nightsOf(b)} nights · {guestSummary(b)}</p>
                      {bookingIssues(b, listings.get(b.listingId)).length > 0 && (
                        <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-bad"><Icon name="alert" size={12} /> Breaks house rules</p>
                      )}
                    </td>
                    <td><StatusBadge status={b.status} /></td>
                    <td className="hidden whitespace-nowrap text-muted lg:table-cell">{timeAgo(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState icon="calendar" title="No bookings match" text="Try a different status or search term." />
        )}
      </div>

      <Overlay
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.guestName ?? ""}
        subtitle={open && <StatusBadge status={open.status} />}
        footer={
          open && (
            <>
              <button type="button" className="a-btn a-btn-danger mr-auto" onClick={() => remove(open)}>
                <Icon name="trash" size={16} /> Delete
              </button>
              {open.status !== "declined" && open.status !== "cancelled" && (
                <button type="button" className="a-btn a-btn-outline" onClick={() => setBookingStatus(open, open.status === "confirmed" ? "cancelled" : "declined")}>
                  {open.status === "confirmed" ? "Cancel stay" : "Decline"}
                </button>
              )}
              {open.status === "new" && (
                <button type="button" className="a-btn a-btn-outline" onClick={() => setBookingStatus(open, "contacted")}>Mark contacted</button>
              )}
              {(open.status === "new" || open.status === "contacted" || open.status === "declined" || open.status === "cancelled") && (
                <button type="button" className="a-btn a-btn-ok" onClick={() => setBookingStatus(open, "confirmed")}>
                  <Icon name="check" size={16} /> Confirm
                </button>
              )}
            </>
          )
        }
      >
        {open && <BookingDetail key={open.id} booking={open} />}
      </Overlay>
    </>
  );
}

function BookingDetail({ booking: b }: { booking: Booking }) {
  const db = useDB();
  const { toast } = useFeedback();
  const listing = db.listings.find((l) => l.id === b.listingId);
  const [notes, setNotes] = useState(b.notes);
  const dirty = notes !== b.notes;
  const issues = bookingIssues(b, listing);

  return (
    <div className="flex flex-col gap-6">
      {issues.length > 0 && (
        <div role="alert" className="rounded-xl border border-[#f3c4c7] bg-bad-tint p-4 text-bad">
          <p className="flex items-center gap-2 font-medium"><Icon name="alert" size={16} /> This request conflicts with the home&apos;s rules</p>
          <ul className="mt-1 list-disc pl-6">{issues.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
        <Info label="Check-in" value={fmtDate(b.checkIn)} />
        <Info label="Check-out" value={fmtDate(b.checkOut)} />
        <Info label="Length" value={`${nightsOf(b)} nights`} />
        <Info label="Guests" value={guestSummary(b)} />
        <Info label="Estimated value" value={listing ? money(Math.round(bookingValue(b, listing))) : "—"} />
        {listing && <Info label="Cleaning fee" value={money(listing.cleaningFee)} />}
        {listing && <Info label="Security deposit" value={`${money(listing.securityDeposit)} (refundable)`} />}
        <Info label="Received" value={timeAgo(b.createdAt)} />
      </dl>

      <section>
        <h3 className="mb-2 text-base">Apartment</h3>
        {listing ? (
          <Link href={`/admin/listings/${listing.id}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={listing.images[0]} alt="" className="h-14 w-20 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{listing.title}</p>
              <p className="text-muted">{listing.neighborhood} · {money(listing.price)}/mo</p>
            </div>
            <Icon name="chevron" size={16} className="text-muted" />
          </Link>
        ) : (
          <p className="text-muted">This listing has been removed.</p>
        )}
      </section>

      <section>
        <h3 className="mb-2 text-base">Contact</h3>
        <div className="flex flex-wrap gap-2">
          <a className="a-btn a-btn-outline a-btn-sm" href={`mailto:${b.email}`}><Icon name="mail" size={15} /> {b.email}</a>
          <a className="a-btn a-btn-outline a-btn-sm" href={`tel:${b.phone.replace(/\s/g, "")}`}><Icon name="phone" size={15} /> {b.phone}</a>
        </div>
      </section>

      {b.message && (
        <section>
          <h3 className="mb-2 text-base">Guest message</h3>
          <p className="rounded-xl bg-soft p-4 leading-relaxed">{b.message}</p>
        </section>
      )}

      <section>
        <label htmlFor="notes" className="mb-2 block font-serif text-base">Internal notes</label>
        <textarea id="notes" className="a-input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to the Nestly team" />
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            className="a-btn a-btn-outline a-btn-sm"
            disabled={!dirty}
            onClick={() => {
              actions.patch("bookings", b.id, { notes });
              toast("Notes saved");
            }}
          >
            Save notes
          </button>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
