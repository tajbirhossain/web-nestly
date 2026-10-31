"use client";

import { useState } from "react";
import { HeartIcon, ShareIcon } from "@/components/ui/icons";
import { useSaved } from "@/lib/saved";

export default function ListingActions({ slug, title }: { slug: string; title: string }) {
  const { saved, toggle } = useSaved();
  const [copied, setCopied] = useState(false);
  const isSaved = saved.includes(slug);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }

  const btn = "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition hover:bg-soft";
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={share} className={btn}>
        <ShareIcon /> {copied ? "Link copied" : "Share"}
      </button>
      <button type="button" aria-pressed={isSaved} onClick={() => toggle(slug)} className={`${btn} ${isSaved ? "text-[#e5484d]" : ""}`}>
        <HeartIcon filled={isSaved} size={18} /> {isSaved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
