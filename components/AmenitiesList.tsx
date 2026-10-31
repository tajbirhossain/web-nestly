"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { AmenityIcon } from "@/components/ui/icons";

export default function AmenitiesList({ items, preview = 8 }: { items: string[]; preview?: number }) {
  const [open, setOpen] = useState(false);
  const row = (x: string) => (
    <li key={x} className="flex items-center gap-4 py-2 text-[15px]">
      <span className="text-ink/80"><AmenityIcon name={x} /></span>
      {x}
    </li>
  );
  return (
    <>
      <ul className="grid gap-x-8 sm:grid-cols-2">{items.slice(0, preview).map(row)}</ul>
      {items.length > preview && (
        <button type="button" onClick={() => setOpen(true)} className="btn btn-outline mt-5 !min-h-11 !border-ink !text-ink hover:!bg-soft">
          View all features ({items.length})
        </button>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="What this home offers">
        <ul className="divide-y divide-line">{items.map(row)}</ul>
      </Modal>
    </>
  );
}
