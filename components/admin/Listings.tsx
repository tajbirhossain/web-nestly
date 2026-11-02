"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { matches } from "@/lib/admin/calc";
import { fmtDate } from "@/lib/admin/format";
import { actions, useDB } from "@/lib/admin/store";
import type { Listing, ListingStatus } from "@/lib/admin/types";
import { bedLabel, money } from "@/lib/data";
import { useFeedback } from "./feedback";
import { Icon } from "./icons";
import { EmptyState, PageHeader, SearchBox, Segmented, StatusBadge } from "./ui";

const statuses: (ListingStatus | "all")[] = ["all", "published", "draft", "archived"];

export default function Listings() {
  const db = useDB();
  const { toast, confirm } = useFeedback();
  const [status, setStatus] = useState<ListingStatus | "all">("all");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () =>
      db.listings
        .filter((l) => (status === "all" || l.status === status) && matches(q, l.title, l.neighborhood, l.borough))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [db.listings, status, q],
  );

  function setListingStatus(l: Listing, next: ListingStatus) {
    actions.patch("listings", l.id, { status: next });
    toast(next === "published" ? "Listing published" : next === "draft" ? "Moved to drafts" : "Listing archived");
  }

  async function remove(l: Listing) {
    const bookings = db.bookings.filter((b) => b.listingId === l.id).length;
    if (!(await confirm({
      title: "Delete this listing?",
      text: bookings
        ? `${l.title} has ${bookings} booking${bookings > 1 ? "s" : ""} attached. Consider archiving instead — deleting can't be undone.`
        : `${l.title} will be permanently removed.`,
      confirmLabel: "Delete",
      danger: true,
    }))) return;
    actions.remove("listings", l.id);
    toast("Listing deleted");
  }

  return (
    <>
      <PageHeader
        title="Listings"
        description="Every apartment on Nestly. Publish, edit, or archive homes."
        actions={
          <Link href="/admin/listings/new" className="a-btn a-btn-primary">
            <Icon name="plus" size={16} /> New listing
          </Link>
        }
      />

      <div className="a-card">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={statuses.map((s) => ({
              value: s,
              label: s === "all" ? "All" : s[0].toUpperCase() + s.slice(1),
              count: s === "all" ? db.listings.length : db.listings.filter((l) => l.status === s).length,
            }))}
          />
          <SearchBox value={q} onChange={setQ} placeholder="Search title or neighborhood" />
        </div>

        {rows.length ? (
          <div className="a-table-wrap">
            <table className="a-table">
              <thead>
                <tr>
                  <th>Apartment</th>
                  <th className="hidden sm:table-cell">Size</th>
                  <th>Price</th>
                  <th className="hidden md:table-cell">Available</th>
                  <th>Status</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link href={`/admin/listings/${l.id}`} className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={l.images[0]} alt="" className="h-12 w-16 shrink-0 rounded-lg bg-soft object-cover" />
                        <div className="min-w-0">
                          <p className="max-w-[280px] truncate font-medium hover:text-brand-dark">
                            {l.title}
                            {l.featured && <span className="ml-2 align-middle text-[11px] font-semibold uppercase tracking-wide text-brand">Featured</span>}
                          </p>
                          <p className="text-muted">{l.neighborhood}, {l.borough}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap sm:table-cell">{bedLabel(l.beds)} · {l.baths} bath<span className="block text-muted">{l.sqft.toLocaleString()} sqft</span></td>
                    <td className="whitespace-nowrap font-medium">{money(l.price)}<span className="font-normal text-muted">/mo</span></td>
                    <td className="hidden whitespace-nowrap text-muted md:table-cell">{fmtDate(l.availableFrom)}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td>
                      <div className="flex justify-end gap-1">
                        {l.status !== "published" ? (
                          <button type="button" className="a-btn a-btn-outline a-btn-sm" onClick={() => setListingStatus(l, "published")}>Publish</button>
                        ) : (
                          <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => setListingStatus(l, "archived")}>Archive</button>
                        )}
                        <Link href={`/admin/listings/${l.id}`} className="a-btn a-btn-ghost a-btn-sm" aria-label={`Edit ${l.title}`}><Icon name="edit" size={16} /></Link>
                        <button type="button" className="a-btn a-btn-ghost a-btn-sm" aria-label={`Delete ${l.title}`} onClick={() => remove(l)}><Icon name="trash" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="building"
            title="No listings found"
            text="Adjust your filters or add a new apartment."
            action={<Link href="/admin/listings/new" className="a-btn a-btn-primary">New listing</Link>}
          />
        )}
      </div>
    </>
  );
}
