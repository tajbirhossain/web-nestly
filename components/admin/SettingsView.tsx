"use client";

import { useEffect, useState } from "react";
import { actions, useDB } from "@/lib/admin/store";
import type { Listing, Settings } from "@/lib/admin/types";
import { LIMITS, STANDARD_POLICIES, newPolicyId, paragraphs, policyProblem, sanitizePolicies, type CancellationPolicy } from "@/lib/cancellation";
import { useFeedback } from "./feedback";
import { Icon } from "./icons";
import { Field, PageHeader, Toggle } from "./ui";

export default function SettingsView() {
  const db = useDB();
  // Re-key on the saved value so the form resets after a save or a demo-data reset.
  return <SettingsForm key={JSON.stringify(db.settings)} saved={db.settings} listings={db.listings} />;
}

function SettingsForm({ saved, listings }: { saved: Settings; listings: Listing[] }) {
  const { toast, confirm } = useFeedback();
  const [s, setS] = useState(saved);
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);
  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  function save() {
    const days = Number(s.minStayDays);
    if (!(days >= 1)) {
      toast("Minimum stay must be at least 1 day", "bad");
      return;
    }
    const policies = sanitizePolicies(s.cancellationPolicies);
    if (!policies.ok) {
      toast(policies.error, "bad");
      return;
    }
    actions.saveSettings({ ...s, minStayDays: days, cancellationPolicies: policies.policies });
    toast("Settings saved");
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Business details and notification preferences."
        actions={
          <>
            <button type="button" className="a-btn a-btn-outline" disabled={!dirty} onClick={() => setS(saved)}>Discard</button>
            <button type="button" className="a-btn a-btn-primary" disabled={!dirty} onClick={save}>Save changes</button>
          </>
        }
      />

      <div className="grid max-w-3xl gap-6">
        <section className="a-card grid gap-4 p-5 sm:grid-cols-2">
          <h2 className="text-lg sm:col-span-2">Business</h2>
          <Field label="Site name">{(id) => <input id={id} className="a-input" value={s.siteName} onChange={(e) => set("siteName", e.target.value)} />}</Field>
          <Field label="Phone">{(id) => <input id={id} className="a-input" value={s.phone} onChange={(e) => set("phone", e.target.value)} />}</Field>
          <Field label="Support email" className="sm:col-span-2" hint="Inquiry and booking notifications are sent here.">
            {(id) => <input id={id} type="email" className="a-input" value={s.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />}
          </Field>
        </section>

        <section className="a-card p-5">
          <h2 className="text-lg">Bookings</h2>
          <div className="divide-y divide-line">
            <Toggle checked={s.bookingsOpen} onChange={(v) => set("bookingsOpen", v)} label="Accept new booking requests" description="Turn off to pause requests, for example during a holiday." />
            <div className="py-3">
              <Field label="Minimum stay (days)">
                {(id) => <input id={id} type="number" min={1} className="a-input max-w-40" value={s.minStayDays} onChange={(e) => set("minStayDays", Number(e.target.value))} />}
              </Field>
            </div>
          </div>
        </section>

        <CancellationPolicies
          policies={s.cancellationPolicies ?? []}
          onChange={(p) => set("cancellationPolicies", p)}
          listings={listings}
          unsaved={JSON.stringify(s.cancellationPolicies ?? []) !== JSON.stringify(saved.cancellationPolicies ?? [])}
        />

        <section className="a-card p-5">
          <h2 className="text-lg">Email notifications</h2>
          <div className="divide-y divide-line">
            <Toggle checked={s.notifyBookings} onChange={(v) => set("notifyBookings", v)} label="New booking requests" />
            <Toggle checked={s.notifyInquiries} onChange={(v) => set("notifyInquiries", v)} label="New inquiries" />
            <Toggle checked={s.notifyHosts} onChange={(v) => set("notifyHosts", v)} label="New host applications" />
          </div>
        </section>

        <section className="a-card border-[#f3c4c7] p-5">
          <h2 className="text-lg">Demo data</h2>
          <p className="mt-1 text-muted">All admin data is sample content stored in this browser until a database is connected. Resetting restores the original samples.</p>
          <button
            type="button"
            className="a-btn a-btn-danger mt-4"
            onClick={async () => {
              if (await confirm({ title: "Reset demo data?", text: "All edits you made in the admin panel will be lost.", confirmLabel: "Reset", danger: true })) {
                actions.reset();
                toast("Demo data reset");
              }
            }}
          >
            Reset demo data
          </button>
        </section>
      </div>
    </>
  );
}

type Draft = { id: string | null; name: string; summary: string; details: string };

/** Standard policies (read-only) plus the admin's special policies, with usage counts per policy. */
function CancellationPolicies({
  policies,
  onChange,
  listings,
  unsaved,
}: {
  policies: CancellationPolicy[];
  onChange: (p: CancellationPolicy[]) => void;
  listings: Listing[];
  unsaved: boolean;
}) {
  const { confirm, toast } = useFeedback();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const usage = (id: string) => listings.filter((l) => l.cancellation === id).length;
  const used = (n: number) => `Used by ${n} listing${n === 1 ? "" : "s"}`;

  // Arriving from a listing's "Manage policies" link: bring this section into view once it renders.
  useEffect(() => {
    if (window.location.hash === "#cancellation") document.getElementById("cancellation")?.scrollIntoView({ block: "start" });
  }, []);

  function saveDraft() {
    if (!draft) return;
    const p: CancellationPolicy = {
      id: draft.id ?? newPolicyId(),
      name: draft.name.trim(),
      summary: draft.summary.trim(),
      ...(draft.details.trim() ? { details: draft.details.trim() } : {}),
    };
    const problem = policyProblem(p, policies.filter((o) => o.id !== p.id));
    if (problem) return setError(problem);
    onChange(draft.id ? policies.map((o) => (o.id === p.id ? p : o)) : [...policies, p]);
    setDraft(null);
    setError("");
  }

  async function remove(p: CancellationPolicy) {
    const n = usage(p.id);
    if (n > 0) {
      toast(`${used(n)}. Switch ${n === 1 ? "it" : "them"} to another policy first.`, "bad");
      return;
    }
    if (!(await confirm({ title: `Delete "${p.name}"?`, text: "Bookings already made keep the policy they were shown.", confirmLabel: "Delete", danger: true }))) return;
    onChange(policies.filter((o) => o.id !== p.id));
  }

  return (
    <section id="cancellation" className="a-card scroll-mt-20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg">Cancellation policies</h2>
          <p className="mt-1 text-muted">Every listing uses one policy. Pick it on the listing&apos;s page. Guests see it on the listing and in their confirmation.</p>
        </div>
        {!draft && (
          <button type="button" className="a-btn a-btn-outline" onClick={() => { setDraft({ id: null, name: "", summary: "", details: "" }); setError(""); }}>
            <Icon name="plus" size={16} /> Add special policy
          </button>
        )}
      </div>

      <h3 className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wide text-muted">Standard</h3>
      <ul className="flex flex-col gap-2">
        {STANDARD_POLICIES.map((p) => (
          <li key={p.id} className="rounded-xl border border-line p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{p.name}</span>
              <span className="rounded-full bg-soft px-2 py-0.5 text-[12px] text-muted">Standard</span>
              <span className="ml-auto text-[12px] text-muted">{used(usage(p.id))}</span>
            </div>
            <p className="mt-1 text-[13px] text-muted">{p.summary}</p>
          </li>
        ))}
      </ul>

      <h3 className="mb-2 mt-5 text-[13px] font-semibold uppercase tracking-wide text-muted">Special</h3>
      {policies.length === 0 && !draft && <p className="text-[13px] text-muted">No special policies yet. Add one for homes with different terms, such as a non-refundable rate or holiday stays.</p>}
      <ul className="flex flex-col gap-2">
        {policies.map((p) =>
          draft?.id === p.id ? (
            <li key={p.id}><PolicyEditor draft={draft} setDraft={setDraft} error={error} setError={setError} onSave={saveDraft} /></li>
          ) : (
            <li key={p.id} className="rounded-xl border border-line p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.name}</span>
                <span className="text-[12px] text-muted">{used(usage(p.id))}</span>
                <span className="ml-auto flex gap-1.5">
                  <button type="button" className="a-btn a-btn-outline a-btn-sm" disabled={!!draft} onClick={() => { setDraft({ id: p.id, name: p.name, summary: p.summary, details: p.details ?? "" }); setError(""); }}>Edit</button>
                  <button type="button" className="a-btn a-btn-outline a-btn-sm" disabled={!!draft} aria-label={`Delete ${p.name}`} onClick={() => void remove(p)}><Icon name="trash" size={14} /></button>
                </span>
              </div>
              <p className="mt-1 text-[13px]">{p.summary}</p>
              {p.details && <div className="mt-1 space-y-1 text-[13px] text-muted">{paragraphs(p.details).map((t, i) => <p key={i} className="whitespace-pre-line">{t}</p>)}</div>}
            </li>
          ),
        )}
        {draft && draft.id === null && <li><PolicyEditor draft={draft} setDraft={setDraft} error={error} setError={setError} onSave={saveDraft} /></li>}
      </ul>
      {unsaved && <p className="mt-3 rounded-lg bg-brand-tint px-3 py-2 text-[13px] text-brand-dark">Click <strong>Save changes</strong> at the top to publish policy changes.</p>}
    </section>
  );
}

function PolicyEditor({
  draft,
  setDraft,
  error,
  setError,
  onSave,
}: {
  draft: Draft;
  setDraft: (d: Draft | null) => void;
  error: string;
  setError: (e: string) => void;
  onSave: () => void;
}) {
  const edit = (patch: Partial<Draft>) => { setDraft({ ...draft, ...patch }); setError(""); };
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-brand bg-brand-tint/40 p-4">
      <Field label="Name" hint="Shown to guests, e.g. Non-refundable or Holiday season.">
        {(id) => <input id={id} className="a-input" maxLength={LIMITS.name} value={draft.name} onChange={(e) => edit({ name: e.target.value })} autoFocus />}
      </Field>
      <Field label="Summary" hint="One or two sentences. Shown in the booking box and the listing.">
        {(id) => <textarea id={id} className="a-input" rows={2} maxLength={LIMITS.summary} value={draft.summary} onChange={(e) => edit({ summary: e.target.value })} />}
      </Field>
      <Field label="Full terms (optional)" hint="Shown on the listing page. Separate paragraphs with a blank line.">
        {(id) => <textarea id={id} className="a-input a-ta-md" maxLength={LIMITS.details} value={draft.details} onChange={(e) => edit({ details: e.target.value })} />}
      </Field>
      {error && <p className="a-error" role="alert">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" className="a-btn a-btn-outline a-btn-sm" onClick={() => { setDraft(null); setError(""); }}>Cancel</button>
        <button type="button" className="a-btn a-btn-primary a-btn-sm" onClick={onSave}>{draft.id ? "Update policy" : "Add policy"}</button>
      </div>
    </div>
  );
}
