"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <button type="button" aria-label="Close dialog" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-ink/55 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl ${
          size === "lg" ? "sm:max-w-2xl" : "sm:max-w-[480px]"
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-serif text-xl">{title}</h2>
          <button
            ref={closeBtn}
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl transition hover:bg-soft"
          >
            ×
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <footer className="flex items-center justify-between gap-4 border-t border-line px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}
