import type { ReactNode } from "react";

const base = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const paths: Record<string, ReactNode> = {
  wifi: <><path d="M5 12.5a10 10 0 0 1 14 0" /><path d="M8.5 16a5 5 0 0 1 7 0" /><circle cx="12" cy="19" r=".6" /><path d="M2 9a14 14 0 0 1 20 0" /></>,
  snow: <><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" /><path d="m9.5 4.5 2.5 2 2.5-2M9.5 19.5l2.5-2 2.5 2" /></>,
  kitchen: <><path d="M7 3v8a2 2 0 0 0 2 2v8M7 3v5M11 3v5M9 3v5" /><path d="M17 3c-2 2-2.5 5-2.5 8h2.5v10" /></>,
  washer: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><circle cx="12" cy="13.5" r="4" /><circle cx="8" cy="6.5" r=".6" /></>,
  dishwasher: <><rect x="4" y="3" width="16" height="18" rx="2.5" /><path d="M4 8h16" /><circle cx="12" cy="14.5" r="3" /></>,
  desk: <><rect x="4" y="5" width="16" height="10" rx="1.5" /><path d="M2 19h20M9 15v4M15 15v4" /></>,
  paw: <><circle cx="6.5" cy="10" r="1.8" /><circle cx="10" cy="6" r="1.8" /><circle cx="14" cy="6" r="1.8" /><circle cx="17.5" cy="10" r="1.8" /><path d="M8 17c0-2.5 2-4.5 4-4.5s4 2 4 4.5c0 1.6-1.4 2.5-4 2.5S8 18.6 8 17Z" /></>,
  doorman: <><circle cx="12" cy="7" r="3.5" /><path d="M5 21c0-4.4 3.1-7 7-7s7 2.6 7 7" /><path d="M9 3.5h6" /></>,
  gym: <><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" /></>,
  linens: <><path d="M3 18V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9" /><path d="M3 14h18M3 18h18M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" /></>,
  tv: <><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></>,
  heat: <><path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.7-2.5 1.5-3.5" /><path d="M12 21a5 5 0 0 0 5-5" /></>,
  iron: <><path d="M3 17h18c0-5-3-9-8-9H8a5 5 0 0 0-5 5v4Z" /><path d="M8 13h6" /></>,
  bath: <><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" /><path d="M6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2" /></>,
  fridge: <><rect x="6" y="2.5" width="12" height="19" rx="2" /><path d="M6 10h12M9 6v2M9 13v3" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

const map: [RegExp, keyof typeof paths][] = [
  [/wi.?fi|internet/i, "wifi"],
  [/air cond/i, "snow"],
  [/kitchen/i, "kitchen"],
  [/dishwasher/i, "dishwasher"],
  [/washer|dryer|laundry/i, "washer"],
  [/workspace|desk/i, "desk"],
  [/pet/i, "paw"],
  [/doorman|concierge|lobby/i, "doorman"],
  [/gym|fitness|pool/i, "gym"],
  [/linen|towel/i, "linens"],
  [/tv/i, "tv"],
  [/heat/i, "heat"],
  [/iron|hair/i, "iron"],
  [/bath/i, "bath"],
  [/refrigerator|fridge/i, "fridge"],
];

export function AmenityIcon({ name, size = 22 }: { name: string; size?: number }) {
  const key = map.find(([re]) => re.test(name))?.[1] ?? "check";
  return <svg {...base} width={size} height={size}>{paths[key]}</svg>;
}

export const HeartIcon = ({ filled = false, size = 20 }: { filled?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.7 3.6 4.5 7 4.5c2 0 3.6 1.1 5 3 1.4-1.9 3-3 5-3 3.4 0 5.3 3.2 4.2 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z" />
  </svg>
);

export const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
  </svg>
);

export const SqftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 20V4h16" /><path d="M4 4l16 16" opacity=".35" /><path d="M8 20h12V8" />
  </svg>
);
