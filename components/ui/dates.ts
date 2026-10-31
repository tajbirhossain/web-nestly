export const MIN_NIGHTS = 30;

export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const nightsBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

export const fmtShort = (iso: string) =>
  fromISO(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const fmtRange = (start?: string, end?: string) => {
  if (!start) return "";
  return end ? `${fmtShort(start)} – ${fmtShort(end)}` : `${fmtShort(start)} – add check-out`;
};
