import type { ReactNode } from "react";
import { amenityIconKey, type AmenityIconKey } from "@/lib/amenities";

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

// Amenity icons: 24px grid, 1.6 stroke, rounded joins. One per catalog icon key (lib/amenities.ts).
const paths: Record<AmenityIconKey, ReactNode> = {
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
  hairdryer: <><circle cx="9" cy="9" r="5" /><circle cx="9" cy="9" r="1.6" /><path d="M9 4h9.5a1.5 1.5 0 0 1 0 5H14" /><path d="M7.5 13.8v5.7a1.5 1.5 0 0 0 3 0v-5.7" /></>,
  microwave: <><rect x="3" y="5" width="18" height="14" rx="2" /><rect x="5.5" y="8" width="9.5" height="8" rx="1" /><path d="M18 8.5v.01M18 11.5v.01M18 15.5h.01" /></>,
  coffee: <><path d="M5 9h11v4.5A5.5 5.5 0 0 1 10.5 19A5.5 5.5 0 0 1 5 13.5V9Z" /><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H15.5" /><path d="M8.5 3c-.9 1 .9 2 0 3.2M12.5 3c-.9 1 .9 2 0 3.2M4 21.5h14" /></>,
  laundry: <><rect x="2.5" y="4" width="9" height="15" rx="2" /><circle cx="7" cy="12.5" r="2.8" /><rect x="12.5" y="4" width="9" height="15" rx="2" /><circle cx="17" cy="12.5" r="2.8" /><path d="M4.5 7h.01M14.5 7h.01M2 21.5h20" /></>,
  chair: <><path d="M8 3h8a1 1 0 0 1 1 1v7H7V4a1 1 0 0 1 1-1Z" /><path d="M5 11h14v1.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 12.5V11Z" /><path d="M12 14v4.5M7.5 21.5 12 18.5l4.5 3" /></>,
  curtains: <><path d="M2.5 3.5h19" /><path d="M5 3.5v17.5h3.5c-1.4-5.2-1.4-12 0-17.5" /><path d="M19 3.5v17.5h-3.5c1.4-5.2 1.4-12 0-17.5" /><path d="M13.6 10.6a2.3 2.3 0 1 1-2.7-2.9 1.9 1.9 0 0 0 2.7 2.9Z" /></>,
  elevator: <><rect x="4" y="2.5" width="16" height="19" rx="2" /><path d="M12 2.5v19" /><path d="m6.5 10 1.75-1.75L10 10M14 8.25 15.75 10l1.75-1.75" /></>,
  pool: <><path d="M8.5 15V5.5a2 2 0 0 1 3.6-1.2M15.5 15V5.5a2 2 0 0 1 3.6-1.2M8.5 8.5h7M8.5 12h7" /><path d="M2 18.5c1.7 0 1.7-1.3 3.3-1.3s1.7 1.3 3.4 1.3 1.6-1.3 3.3-1.3 1.7 1.3 3.3 1.3 1.7-1.3 3.4-1.3 1.6 1.3 3.3 1.3" /></>,
  package: <><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" /><path d="m3 7.5 9 4.5 9-4.5M12 12v9M7.5 5.25l9 4.5" /></>,
  bike: <><circle cx="5.5" cy="16" r="3.5" /><circle cx="18.5" cy="16" r="3.5" /><path d="m5.5 16 3.5-7h6.5l3 7M9 9l3.5 7h-7M13.5 6h2.5" /></>,
  storage: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M4.5 9v10a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V9M10 13h4" /></>,
  balcony: <><path d="M7 13V4.5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1V13" /><path d="M14 8.5v.01" /><path d="M3 13h18M3 21h18M5 13v8M9 13v8M15 13v8M19 13v8" /></>,
  tree: <><path d="M12 21v-5.5" /><path d="M12 3a5 5 0 0 0-5 5 4 4 0 0 0 .5 7.5h9A4 4 0 0 0 17 8a5 5 0 0 0-5-5Z" /><path d="M9.5 12.5 12 15l2.5-2.5M4 21h16" /></>,
  key: <><circle cx="8" cy="15" r="4.5" /><circle cx="8" cy="15" r="1.2" /><path d="m11.2 11.8 8.8-8.8M16.5 6.5l2 2M14.5 8.5l1.5 1.5" /></>,
  parking: <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M10 17V7h3.5a3 3 0 0 1 0 6H10" /></>,
  smoke: <><path d="M4.5 5.5h15" /><path d="M6 5.5a6 6 0 0 0 12 0" /><circle cx="12" cy="7" r="1.2" /><path d="M8 15.5c.9 1 .9 2 0 3M12 16c.9 1.2.9 2.5 0 4M16 15.5c.9 1 .9 2 0 3" /></>,
  co: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10.5 10a2.2 2.2 0 1 0 0 4" /><circle cx="15" cy="12" r="2" /></>,
  extinguisher: <><path d="M9.5 21.5h5a1.5 1.5 0 0 0 1.5-1.5v-8.5a4 4 0 0 0-8 0V20a1.5 1.5 0 0 0 1.5 1.5Z" /><path d="M12 7.5V4.5M9.5 4.5h5l3 2.5" /><path d="M8 13h8" /></>,
  firstaid: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M12 10.5v6M9 13.5h6" /></>,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
};

export function AmenityIcon({ name, size = 22 }: { name: string; size?: number }) {
  return <svg {...base} width={size} height={size}>{paths[amenityIconKey(name)]}</svg>;
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
