"use client";

import { useState } from "react";
import Select from "@/components/ui/Select";
import { DatesPicker, GuestsPicker } from "@/components/ui/Pickers";

type Field = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
  textarea?: boolean;
  half?: boolean;
  /** Custom controls: a check-in/out range (writes movein + moveout) or a guest stepper. */
  kind?: "dates" | "guests";
};

export default function InquiryForm({
  type,
  fields,
  submitLabel = "Send message",
  extra = {},
  successText = "Thanks — we'll be in touch shortly.",
}: {
  type: "contact" | "booking" | "host" | "corporate" | "relocation";
  fields: Field[];
  submitLabel?: string;
  extra?: Record<string, string>;
  successText?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [guests, setGuests] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const missing = fields.find(
      (f) =>
        f.required &&
        ((f.options && !picked[f.name]) || (f.kind === "dates" && !(start && end)) || (f.kind === "guests" && !guests)),
    );
    if (missing) {
      setError(`Please choose ${missing.kind === "dates" ? "your check-in and check-out dates" : missing.label.toLowerCase()}.`);
      setState("error");
      return;
    }
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...extra, type }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Something went wrong");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-2xl bg-brand-tint p-8 text-center">
        <p className="font-serif text-2xl">Request received</p>
        <p className="mt-2 text-muted">{successText}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `${type}-${f.name}`;
        return (
          <div key={f.name} className={f.half ? "" : "sm:col-span-2"}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
              {f.label}
              {f.required && <span className="text-brand"> *</span>}
            </label>
            {f.kind === "dates" ? (
              <DatesPicker
                name
                start={start}
                end={end}
                onChange={(s, e) => {
                  setStart(s);
                  setEnd(e);
                }}
                variant="field"
                placeholder="Check-in → check-out"
                panelClass="w-[720px]"
              />
            ) : f.kind === "guests" ? (
              <GuestsPicker name={f.name} value={guests} onChange={setGuests} variant="field" placeholder="Add guests" align="left" />
            ) : f.options ? (
              <Select
                name={f.name}
                label={f.label}
                placeholder="Select…"
                variant="field"
                value={picked[f.name] ?? ""}
                onChange={(v) => setPicked((p) => ({ ...p, [f.name]: v }))}
                options={f.options.map((o) => ({ value: o, label: o }))}
              />
            ) : f.textarea ? (
              <textarea id={id} name={f.name} required={f.required} rows={4} className="field" />
            ) : (
              <input id={id} name={f.name} type={f.type ?? "text"} required={f.required} className="field" />
            )}
          </div>
        );
      })}
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full disabled:opacity-60">
          {state === "sending" ? "Sending…" : submitLabel}
        </button>
        {state === "error" && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      </div>
    </form>
  );
}
