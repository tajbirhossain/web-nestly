import { cacheLife, cacheTag } from "next/cache";
import type { Settings } from "@/lib/admin/types";
import { dbEnabled, sql } from "@/lib/db";

// Everything the admin controls on its Settings page, with safe defaults.
export type SiteSettings = Settings;
export type BookingSettings = Pick<Settings, "minStayDays" | "bookingsOpen">;

const defaults: SiteSettings = {
  siteName: "Nestly",
  supportEmail: "hello@nestly.nyc",
  phone: "",
  minStayDays: 30,
  bookingsOpen: true,
  notifyBookings: true,
  notifyInquiries: true,
  notifyHosts: true,
};

/** Always reads the database; used by APIs so a request is judged on the latest rules. */
export async function fetchSettings(): Promise<SiteSettings> {
  if (!dbEnabled) return defaults;
  try {
    const rows = await sql`select data from settings where id = 'main' limit 1`;
    const s = (rows[0]?.data ?? {}) as Partial<Settings>;
    return {
      ...defaults,
      ...Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined && v !== null && v !== "")),
      phone: s.phone ?? defaults.phone,
      minStayDays: Number.isFinite(s.minStayDays) && s.minStayDays! >= 1 ? s.minStayDays! : defaults.minStayDays,
      bookingsOpen: s.bookingsOpen ?? defaults.bookingsOpen,
    };
  } catch (e) {
    console.error("[settings] database read failed, using defaults:", e);
    return defaults;
  }
}

/** Cached for public pages; the admin busts the "settings" tag whenever settings are saved. */
export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag("settings");
  // `stale` must stay >= 5 min or Next treats this as dynamic and drops it from the prerender.
  cacheLife({ stale: 300, revalidate: 30, expire: 3600 });
  return fetchSettings();
}
