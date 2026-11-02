"use client";

import { useMemo, useState } from "react";
import { matches } from "@/lib/admin/calc";
import { fmtDate, timeAgo } from "@/lib/admin/format";
import { actions, useDB } from "@/lib/admin/store";
import type { Inquiry, InquiryStatus, InquiryType } from "@/lib/admin/types";
import { useFeedback } from "./feedback";
import { Icon } from "./icons";
import { Badge, EmptyState, Overlay, PageHeader, SearchBox, Segmented, StatusBadge } from "./ui";

const typeLabel: Record<InquiryType, string> = { contact: "General", corporate: "Corporate", relocation: "Relocation", newsletter: "Newsletter" };
const statuses: (InquiryStatus | "all")[] = ["all", "new", "in-progress", "resolved"];

export default function Inquiries() {
  const db = useDB();
  const { toast, confirm } = useFeedback();
  const [status, setStatus] = useState<InquiryStatus | "all">("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      db.inquiries
        .filter((i) => (status === "all" || i.status === status) && matches(q, i.name, i.email, i.company, i.message))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [db.inquiries, status, q],
  );
  const open = db.inquiries.find((i) => i.id === openId);

  function setInquiryStatus(i: Inquiry, next: InquiryStatus) {
    actions.patch("inquiries", i.id, { status: next });
    toast(next === "resolved" ? "Marked as resolved" : `Marked ${next.replace("-", " ")}`);
  }

  async function remove(i: Inquiry) {
    if (!(await confirm({ title: "Delete this inquiry?", text: "This permanently removes the message.", confirmLabel: "Delete", danger: true }))) return;
    actions.remove("inquiries", i.id);
    setOpenId(null);
    toast("Inquiry deleted");
  }

  return (
    <>
      <PageHeader title="Inquiries" description="Messages from the contact, corporate, relocation and newsletter forms." />

      <div className="a-card">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={statuses.map((s) => ({
              value: s,
              label: s === "all" ? "All" : s === "in-progress" ? "In progress" : s[0].toUpperCase() + s.slice(1),
              count: s === "all" ? db.inquiries.length : db.inquiries.filter((i) => i.status === s).length,
            }))}
          />
          <SearchBox value={q} onChange={setQ} placeholder="Search name, email or message" />
        </div>

        {rows.length ? (
          <ul className="divide-y divide-line">
            {rows.map((i) => (
              <li key={i.id}>
                <button type="button" onClick={() => setOpenId(i.id)} className="flex w-full items-start gap-4 px-4 py-4 text-left hover:bg-[#fafaff]">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${i.status === "new" ? "bg-brand" : "bg-transparent"}`} aria-label={i.status === "new" ? "Unread" : undefined} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={i.status === "new" ? "font-semibold" : "font-medium"}>{i.name}</span>
                      {i.company && <span className="text-muted">· {i.company}</span>}
                      <Badge tone="neutral">{typeLabel[i.type]}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-muted">{i.message}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={i.status} />
                    <span className="text-xs text-muted">{timeAgo(i.createdAt)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon="inbox" title="Nothing here" text="No inquiries match this filter." />
        )}
      </div>

      <Overlay
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open?.name ?? ""}
        subtitle={open && `${typeLabel[open.type]} inquiry · ${fmtDate(open.createdAt)}`}
        footer={
          open && (
            <>
              <button type="button" className="a-btn a-btn-danger mr-auto" onClick={() => remove(open)}>
                <Icon name="trash" size={16} /> Delete
              </button>
              {open.status !== "in-progress" && open.status !== "resolved" && (
                <button type="button" className="a-btn a-btn-outline" onClick={() => setInquiryStatus(open, "in-progress")}>Start working</button>
              )}
              {open.status !== "resolved" ? (
                <button type="button" className="a-btn a-btn-ok" onClick={() => setInquiryStatus(open, "resolved")}>
                  <Icon name="check" size={16} /> Mark resolved
                </button>
              ) : (
                <button type="button" className="a-btn a-btn-outline" onClick={() => setInquiryStatus(open, "new")}>Reopen</button>
              )}
            </>
          )
        }
      >
        {open && (
          <div className="flex flex-col gap-5">
            <StatusBadge status={open.status} />
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
                <dd className="mt-0.5 break-all font-medium">{open.email}</dd>
              </div>
              {open.company && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted">Company</dt>
                  <dd className="mt-0.5 font-medium">{open.company}</dd>
                </div>
              )}
            </dl>
            <div>
              <h3 className="mb-2 text-base">Message</h3>
              <p className="whitespace-pre-line rounded-xl bg-soft p-4 leading-relaxed">{open.message}</p>
            </div>
            <a
              className="a-btn a-btn-primary self-start"
              href={`mailto:${open.email}?subject=${encodeURIComponent("Re: your Nestly inquiry")}`}
              onClick={() => open.status === "new" && actions.patch("inquiries", open.id, { status: "in-progress" })}
            >
              <Icon name="mail" size={16} /> Reply by email
            </a>
          </div>
        )}
      </Overlay>
    </>
  );
}
