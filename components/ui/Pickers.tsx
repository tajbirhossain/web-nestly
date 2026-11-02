"use client";

import FieldPopover from "@/components/ui/FieldPopover";
import DateRangePanel from "@/components/ui/DateRangePanel";
import { fmtShort } from "@/components/ui/dates";

type Variant = "segment" | "pill" | "field";

export function DatesPicker({
  start,
  end,
  onChange,
  variant = "segment",
  label = "Dates",
  placeholder = "Add dates",
  align = "left",
  className,
  panelClass = "w-[720px]",
  name,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  variant?: Variant;
  label?: string;
  placeholder?: string;
  align?: "left" | "right";
  className?: string;
  panelClass?: string;
  /** Base name for hidden inputs, e.g. "stay" → stayStart / stayEnd. Defaults to movein / moveout. */
  name?: boolean;
}) {
  const value = start ? (end ? `${fmtShort(start)} – ${fmtShort(end)}` : `${fmtShort(start)} → check-out`) : "";
  return (
    <>
      {name && (
        <>
          <input type="hidden" name="movein" value={start} />
          <input type="hidden" name="moveout" value={end} />
        </>
      )}
      <FieldPopover label={label} value={value} placeholder={placeholder} variant={variant} align={align} className={className} panelClass={panelClass}>
        {(close) => <DateRangePanel start={start} end={end} onChange={onChange} onDone={close} />}
      </FieldPopover>
    </>
  );
}

export type Guests = { adults: number; children: number };
export const noGuests: Guests = { adults: 0, children: 0 };
export const guestTotal = (g: Guests) => g.adults + g.children;

/** "2 adults · 1 child", or "" when nothing is chosen. */
export function guestLabel(g: Guests) {
  const parts = [];
  if (g.adults) parts.push(`${g.adults} adult${g.adults > 1 ? "s" : ""}`);
  if (g.children) parts.push(`${g.children} child${g.children > 1 ? "ren" : ""}`);
  return parts.join(" · ");
}

/**
 * Adults + children stepper.
 * childPolicy: "allow" shows both rows, "blocked" shows children as unavailable (the home does not
 * allow them), "hidden" shows a single Guests row (adults only, e.g. team size).
 */
export function GuestsPicker({
  value,
  onChange,
  variant = "segment",
  label = "Guests",
  placeholder = "Add guests",
  align = "right",
  className,
  name,
  childPolicy = "allow",
  max = 10,
}: {
  value: Guests;
  onChange: (g: Guests) => void;
  variant?: Variant;
  label?: string;
  placeholder?: string;
  align?: "left" | "right";
  className?: string;
  /** Base name for hidden inputs: name (total), nameAdults, nameChildren. */
  name?: string;
  childPolicy?: "allow" | "blocked" | "hidden";
  /** Most guests (adults + children) that can be selected. */
  max?: number;
}) {
  const total = guestTotal(value);
  const full = total >= max;
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-line text-xl transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line";

  // A child needs an adult: adding the first child adds one adult; removing the last adult clears children.
  const setAdults = (n: number) => onChange({ adults: n, children: n === 0 ? 0 : value.children });
  const setChildren = (n: number) => onChange({ adults: n > 0 && value.adults === 0 ? 1 : value.adults, children: n });

  const row = (title: string, hint: string, n: number, set: (n: number) => void, opts: { min?: number; disabled?: boolean; plural: string }) => (
    <div className={`flex items-center justify-between gap-4 ${opts.disabled ? "opacity-60" : ""}`}>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-[13px] text-muted">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`Fewer ${opts.plural}`} disabled={opts.disabled || n <= (opts.min ?? 0)} onClick={() => set(n - 1)} className={btn}>
          −
        </button>
        <span className="w-5 text-center tabular-nums" aria-live="polite">{n || "—"}</span>
        <button type="button" aria-label={`More ${opts.plural}`} disabled={opts.disabled || full} onClick={() => set(n + 1)} className={btn}>
          +
        </button>
      </div>
    </div>
  );

  return (
    <>
      {name && (
        <>
          <input type="hidden" name={name} value={total || ""} />
          {childPolicy !== "hidden" && (
            <>
              <input type="hidden" name={`${name}Adults`} value={value.adults || ""} />
              <input type="hidden" name={`${name}Children`} value={value.children || ""} />
            </>
          )}
        </>
      )}
      <FieldPopover
        label={label}
        value={total ? (childPolicy === "hidden" ? `${total} guest${total > 1 ? "s" : ""}` : guestLabel(value)) : ""}
        placeholder={placeholder}
        variant={variant}
        align={align}
        className={className}
        panelClass="w-[320px]"
      >
        {(close) => (
          <div>
            <div className="space-y-4">
              {childPolicy === "hidden"
                ? row("Guests", "Everyone staying", value.adults, setAdults, { plural: "guests" })
                : row("Adults", "Ages 18 or above", value.adults, setAdults, { plural: "adults" })}
              {childPolicy !== "hidden" && row("Children", "Ages 0–17", value.children, setChildren, { disabled: childPolicy === "blocked", plural: "children" })}
            </div>
            {childPolicy === "blocked" && (
              <p className="mt-3 rounded-xl bg-soft px-3 py-2 text-[13px] text-muted">This home doesn&apos;t allow children.</p>
            )}
            {full && <p className="mt-3 text-[13px] text-muted">Up to {max} guests at this home.</p>}
            <div className="mt-4 flex justify-between border-t border-line pt-3">
              <button type="button" onClick={() => onChange(noGuests)} className="text-sm font-medium underline underline-offset-4 hover:text-brand">
                Clear
              </button>
              <button type="button" onClick={close} className="btn btn-primary !min-h-10 !px-6 !text-sm">
                Done
              </button>
            </div>
          </div>
        )}
      </FieldPopover>
    </>
  );
}
