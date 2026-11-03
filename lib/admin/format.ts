// Dates are ISO strings; format in UTC so server and client render the same text.

/** "Now" for the demo dataset. Swap for new Date() once real data is wired in. */
export const NOW = "2026-11-02T15:00:00Z";
export const TODAY = NOW.slice(0, 10);

/** The real current date (YYYY-MM-DD). NOW above only anchors the sample data. */
export const todayISO = () => new Date().toISOString().slice(0, 10);

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const fmtShort = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Whole days between two ISO dates. */
export const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function timeAgo(iso: string, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days < 30 ? `${days}d ago` : fmtDate(iso);
}

export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
