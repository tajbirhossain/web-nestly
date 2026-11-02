"use client";

import { useState } from "react";
import { timeAgo } from "@/lib/admin/format";
import { actions, useDB } from "@/lib/admin/store";
import type { HostApplication, HostStatus } from "@/lib/admin/types";
import { bedLabel, money } from "@/lib/data";
import { useFeedback } from "./feedback";
import { Icon } from "./icons";
import { EmptyState, PageHeader, Segmented, StatusBadge } from "./ui";

const statuses: (HostStatus | "all")[] = ["pending", "approved", "rejected", "all"];

export default function Hosts() {
  const db = useDB();
  const { toast, confirm } = useFeedback();
  const [status, setStatus] = useState<HostStatus | "all">("pending");
  const rows = db.hosts
    .filter((h) => status === "all" || h.status === status)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  async function decide(h: HostApplication, next: HostStatus) {
    if (next === "rejected" && !(await confirm({
      title: "Reject this application?",
      text: `${h.name} will not be invited to list. You can still approve them later.`,
      confirmLabel: "Reject",
      danger: true,
    }))) return;
    actions.patch("hosts", h.id, { status: next });
    toast(next === "approved" ? `${h.name} approved` : `${h.name} rejected`);
  }

  return (
    <>
      <PageHeader title="Host applications" description="Review properties from people who want to list with Nestly." />

      <div className="mb-4">
        <Segmented
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={statuses.map((s) => ({
            value: s,
            label: s[0].toUpperCase() + s.slice(1),
            count: s === "all" ? db.hosts.length : db.hosts.filter((h) => h.status === s).length,
          }))}
        />
      </div>

      {rows.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {rows.map((h) => (
            <li key={h.id} className="a-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-medium">{h.name}</p>
                  <p className="text-muted">Applied {timeAgo(h.createdAt)}</p>
                </div>
                <StatusBadge status={h.status} />
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-soft p-3">
                <div><dt className="text-xs uppercase tracking-wide text-muted">Home</dt><dd className="font-medium">{bedLabel(h.beds)}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-muted">Area</dt><dd className="font-medium">{h.borough}</dd></div>
                <div><dt className="text-xs uppercase tracking-wide text-muted">Rent</dt><dd className="font-medium">{money(h.expectedRent)}</dd></div>
              </dl>

              <p className="mt-3 font-medium">{h.address}</p>
              <p className="mt-1 flex-1 text-muted">{h.message}</p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <a className="a-btn a-btn-ghost a-btn-sm" href={`mailto:${h.email}`}><Icon name="mail" size={15} /> Email</a>
                <a className="a-btn a-btn-ghost a-btn-sm" href={`tel:${h.phone.replace(/\s/g, "")}`}><Icon name="phone" size={15} /> Call</a>
                <div className="ml-auto flex gap-2">
                  {h.status !== "rejected" && (
                    <button type="button" className="a-btn a-btn-danger a-btn-sm" onClick={() => decide(h, "rejected")}>Reject</button>
                  )}
                  {h.status !== "approved" && (
                    <button type="button" className="a-btn a-btn-ok a-btn-sm" onClick={() => decide(h, "approved")}>
                      <Icon name="check" size={15} /> Approve
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="a-card"><EmptyState icon="key" title="No applications here" text="New host applications will show up in this list." /></div>
      )}
    </>
  );
}
