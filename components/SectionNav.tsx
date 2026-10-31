"use client";

import { useEffect, useState } from "react";

export default function SectionNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Page sections" className="sticky top-[72px] z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-n flex gap-7 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            aria-current={active === i.id ? "true" : undefined}
            className={`whitespace-nowrap border-b-2 py-4 text-sm transition ${
              active === i.id ? "border-brand font-medium text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
