"use client";

import { useState } from "react";

export default function ExpandableText({ paragraphs, previewChars = 260 }: { paragraphs: string[]; previewChars?: number }) {
  const full = paragraphs.join("\n\n");
  const long = full.length > previewChars;
  const [open, setOpen] = useState(false);
  const shown = open || !long ? paragraphs : [full.slice(0, previewChars).replace(/\s+\S*$/, "") + "…"];
  return (
    <div>
      <div className="space-y-4 text-[17px] leading-8 text-muted">
        {shown.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      {long && (
        <button type="button" onClick={() => setOpen((o) => !o)} className="btn btn-outline mt-5 !min-h-11 !border-ink !text-ink hover:!bg-soft">
          {open ? "View less" : "View more"}
        </button>
      )}
    </div>
  );
}
