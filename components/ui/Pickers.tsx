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

export function GuestsPicker({
  value,
  onChange,
  variant = "segment",
  label = "Guests",
  placeholder = "Add guests",
  align = "right",
  className,
  name,
}: {
  value: number;
  onChange: (n: number) => void;
  variant?: Variant;
  label?: string;
  placeholder?: string;
  align?: "left" | "right";
  className?: string;
  name?: string;
}) {
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-full border border-line text-xl transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-line";
  return (
    <>
      {name && <input type="hidden" name={name} value={value || ""} />}
      <FieldPopover
        label={label}
        value={value ? `${value} guest${value > 1 ? "s" : ""}` : ""}
        placeholder={placeholder}
        variant={variant}
        align={align}
        className={className}
        panelClass="w-[300px]"
      >
        {(close) => (
          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Guests</p>
                <p className="text-[13px] text-muted">Everyone staying, including children</p>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" aria-label="Fewer guests" disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 1))} className={btn}>
                  −
                </button>
                <span className="w-5 text-center tabular-nums" aria-live="polite">{value || "—"}</span>
                <button type="button" aria-label="More guests" disabled={value >= 10} onClick={() => onChange(Math.min(10, value + 1))} className={btn}>
                  +
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-3">
              <button type="button" onClick={() => onChange(0)} className="text-sm font-medium underline underline-offset-4 hover:text-brand">
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
