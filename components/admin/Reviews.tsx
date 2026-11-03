"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/admin/format";
import { actions, useDB } from "@/lib/admin/store";
import type { Review, ReviewStatus } from "@/lib/admin/types";
import { useFeedback } from "./feedback";
import { Icon } from "./icons";
import { EmptyState, PageHeader, Segmented, Stars, StatusBadge } from "./ui";

const statuses: (ReviewStatus | "all")[] = ["pending", "published", "hidden", "all"];

export default function Reviews() {
  const db = useDB();
  const { toast, confirm } = useFeedback();
  const [status, setStatus] = useState<ReviewStatus | "all">("pending");
  const rows = db.reviews
    .filter((r) => status === "all" || r.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const published = db.reviews.filter((r) => r.status === "published");
  const avg = published.length ? published.reduce((s, r) => s + r.rating, 0) / published.length : 0;

  function setReviewStatus(r: Review, next: ReviewStatus) {
    actions.patch("reviews", r.id, { status: next });
    toast(next === "published" ? "Review published" : "Review hidden");
  }

  async function remove(r: Review) {
    if (!(await confirm({ title: "Delete this review?", text: "This permanently removes it.", confirmLabel: "Delete", danger: true }))) return;
    actions.remove("reviews", r.id);
    toast("Review deleted");
  }

  return (
    <>
      <PageHeader
        title="Reviews"
        description="Approve guest reviews before they appear on the site."
        actions={
          <div className="a-card flex items-center gap-3 px-4 py-2">
            <span className="font-serif text-2xl">{avg.toFixed(1)}</span>
            <div>
              <Stars value={Math.round(avg)} />
              <p className="text-xs text-muted">{published.length} published</p>
            </div>
          </div>
        }
      />

      <div className="mb-4">
        <Segmented
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={statuses.map((s) => ({
            value: s,
            label: s[0].toUpperCase() + s.slice(1),
            count: s === "all" ? db.reviews.length : db.reviews.filter((r) => r.status === s).length,
          }))}
        />
      </div>

      {rows.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="a-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{r.name}</p>
                  <p className="truncate text-muted">{r.stay} · {timeAgo(r.createdAt)}</p>
                  {r.email && (
                    <p className="truncate text-xs text-muted">
                      {r.email}
                      {r.verifiedStay && <span className="ml-2 rounded-full bg-ok-tint px-2 py-0.5 font-medium text-ok">Verified stay</span>}
                    </p>
                  )}
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-3"><Stars value={r.rating} /></div>
              <p className="mt-2 flex-1 leading-relaxed">{r.text}</p>
              <div className="mt-4 flex items-center gap-2">
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => remove(r)}>
                  <Icon name="trash" size={15} /> Delete
                </button>
                <div className="ml-auto flex gap-2">
                  {r.status !== "hidden" && (
                    <button type="button" className="a-btn a-btn-outline a-btn-sm" onClick={() => setReviewStatus(r, "hidden")}>Hide</button>
                  )}
                  {r.status !== "published" && (
                    <button type="button" className="a-btn a-btn-ok a-btn-sm" onClick={() => setReviewStatus(r, "published")}>
                      <Icon name="check" size={15} /> Publish
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="a-card"><EmptyState icon="star" title="No reviews here" text="Nothing to moderate in this view." /></div>
      )}
    </>
  );
}
