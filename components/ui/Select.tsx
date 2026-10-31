"use client";

import FieldPopover from "@/components/ui/FieldPopover";

export type Option = { value: string; label: string; hint?: string; group?: string };

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
  variant?: "segment" | "pill" | "field";
  align?: "left" | "right";
  panelClass?: string;
  className?: string;
  /** When set, renders a hidden input so the value is included in FormData. */
  name?: string;
};

export default function Select({ label, value, onChange, options, placeholder, name, ...rest }: Props) {
  const current = options.find((o) => o.value === value);
  // A pill with the "empty" option selected should read as unfiltered.
  const shown = value ? current?.label : undefined;

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <FieldPopover label={label} value={shown} placeholder={placeholder ?? label} {...rest}>
        {(close) => (
          <ul role="listbox" aria-label={label} className="max-h-[320px] space-y-0.5 overflow-y-auto">
            {options.map((o, i) => {
              const selected = o.value === value;
              return (
                <li key={o.value} role="presentation">
                  {o.group && options[i - 1]?.group !== o.group && (
                    <p className="px-3 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{o.group}</p>
                  )}
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(o.value);
                      close();
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-soft ${
                      selected ? "bg-brand-tint" : ""
                    }`}
                  >
                    <span>
                      <span className={`block text-[15px] ${selected ? "font-medium text-brand" : "text-ink"}`}>{o.label}</span>
                      {o.hint && <span className="block text-[13px] text-muted">{o.hint}</span>}
                    </span>
                    {selected && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </FieldPopover>
    </>
  );
}
