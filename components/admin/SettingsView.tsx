"use client";

import { useState } from "react";
import { actions, useDB } from "@/lib/admin/store";
import type { Settings } from "@/lib/admin/types";
import { useFeedback } from "./feedback";
import { Field, PageHeader, Toggle } from "./ui";

export default function SettingsView() {
  const db = useDB();
  // Re-key on the saved value so the form resets after a save or a demo-data reset.
  return <SettingsForm key={JSON.stringify(db.settings)} saved={db.settings} />;
}

function SettingsForm({ saved }: { saved: Settings }) {
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
    actions.saveSettings({ ...s, minStayDays: days });
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
