"use client";

import { useEffect, useId, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";

// ---- Status badges ---------------------------------------------------------
type Tone = "ok" | "warn" | "bad" | "brand" | "neutral";
const tones: Record<Tone, string> = {
  ok: "bg-ok-tint text-ok",
  warn: "bg-warn-tint text-warn",
  bad: "bg-bad-tint text-bad",
  brand: "bg-brand-tint text-brand-dark",
  neutral: "bg-soft text-muted",
};

const statusTone: Record<string, Tone> = {
  published: "ok", confirmed: "ok", approved: "ok", resolved: "ok",
  draft: "neutral", archived: "neutral", cancelled: "neutral", hidden: "neutral",
  new: "brand", pending: "warn", contacted: "warn", "in-progress": "warn",
  declined: "bad", rejected: "bad",
};

export function Badge({ children, tone }: { children: ReactNode; tone: Tone }) {
  return <span className={`a-badge ${tones[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? "neutral"}>{status.replace("-", " ").replace(/^./, (c) => c.toUpperCase())}</Badge>;
}

// ---- Layout pieces ---------------------------------------------------------
export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-tint text-brand-dark">
        <Icon name={icon} size={22} />
      </span>
      <p className="mt-4 font-medium">{title}</p>
      {text && <p className="mt-1 max-w-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Filter pills with live counts, e.g. All 12 · New 3 · Confirmed 4. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors ${
              active ? "border-brand bg-brand-tint text-brand-dark" : "border-line bg-white text-muted hover:text-foreground"
            }`}
          >
            {o.label}
            {o.count !== undefined && (
              <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white text-brand-dark" : "bg-soft"}`}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Icon name="search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="a-input a-has-icon"
      />
    </div>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="a-label">{label}</label>
      {children(id)}
      {error ? <p className="a-error" role="alert">{error}</p> : hint ? <p className="a-hint">{hint}</p> : null}
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex text-[#e7a400]" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} width="14" height="14" viewBox="0 0 24 24" fill={n <= value ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
        </svg>
      ))}
    </span>
  );
}

export function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="font-medium">{label}</p>
        {description && <p className="text-muted">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-[#cfcfd9]"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

// ---- Overlays --------------------------------------------------------------
/** Right-hand drawer (default) or centered modal. Closes on Esc / backdrop click. */
export function Overlay({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  variant = "drawer",
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  variant?: "drawer" | "modal";
  wide?: boolean;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  const drawer = variant === "drawer";
  return (
    <div className={`fixed inset-0 z-[70] flex ${drawer ? "justify-end" : "items-center justify-center p-4"}`}>
      <div className="a-anim-fade absolute inset-0 bg-[rgba(23,24,25,.45)]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-full flex-col bg-white shadow-2xl ${
          drawer
            ? `a-anim-slide h-full w-full ${wide ? "max-w-2xl" : "max-w-lg"}`
            : `a-anim-pop w-full rounded-2xl ${wide ? "max-w-2xl" : "max-w-md"}`
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl">{title}</h2>
            {subtitle && <div className="mt-0.5 text-muted">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} className="a-btn a-btn-ghost a-btn-sm -mr-2" aria-label="Close">
            <Icon name="x" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-white px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
