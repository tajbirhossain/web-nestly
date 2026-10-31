"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";

type Props = {
  label: string;
  value?: string;
  placeholder: string;
  /** segment = inside the hero search bar, pill = filter chip, field = form input */
  variant?: "segment" | "pill" | "field";
  align?: "left" | "right";
  panelClass?: string;
  className?: string;
  children: (close: () => void) => ReactNode;
};

const chevron = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function FieldPopover({
  label,
  value,
  placeholder,
  variant = "segment",
  align = "left",
  panelClass = "w-[340px]",
  className = "",
  children,
}: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    // Make sure the whole panel (incl. its Apply button) is on screen.
    const raf = requestAnimationFrame(() => panel.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const triggerClass = {
    segment: `w-full rounded-3xl px-6 py-3 text-left transition md:rounded-full ${open ? "bg-brand-tint" : "hover:bg-soft"}`,
    pill: `inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition ${
      value || open ? "border-brand bg-brand-tint text-brand" : "border-line bg-white text-ink hover:border-ink/40"
    }`,
    field: `field flex items-center justify-between gap-3 text-left ${open ? "!border-brand !shadow-[0_0_0_3px_rgba(92,92,255,.15)]" : ""}`,
  }[variant];

  return (
    <div ref={root} className={`relative ${className}`}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
      >
        {variant === "segment" ? (
          <>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</span>
            <span className={`block truncate text-[15px] ${value ? "font-medium text-ink" : "text-muted"}`}>{value || placeholder}</span>
          </>
        ) : (
          <>
            <span className={`truncate ${variant === "field" && !value ? "text-muted" : ""}`}>{value || (variant === "pill" ? label : placeholder)}</span>
            <span className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>{chevron}</span>
          </>
        )}
      </button>
      {open && (
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-label={label}
          className={`absolute top-full z-50 mt-3 max-w-[calc(100vw-32px)] rounded-3xl border border-line bg-white p-4 text-ink shadow-[0_24px_60px_rgba(23,24,25,.18)] max-md:!w-auto max-md:left-0 max-md:right-0 ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClass}`}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}
