import { NextResponse } from "next/server";
import { dbEnabled, sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { fetchSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";
import type { Booking, HostApplication } from "@/lib/admin/types";

// Emails the guest or host after the admin changes their status. Demo-only: no auth. It
// re-reads the record from the database and only ever mails the address stored on it.
type Body = { kind: "booking" | "host"; id: string; status: string };

export async function POST(req: Request) {
  if (!dbEnabled) return NextResponse.json({ ok: false, skipped: "no database" });
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body || typeof body.id !== "string" || (body.kind !== "booking" && body.kind !== "host")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const settings = await fetchSettings();
  const sign = `\n\n${settings.siteName}${settings.phone ? `\n${settings.phone}` : ""}\n${settings.supportEmail}`;

  try {
    if (body.kind === "booking") {
      const rows = await sql`select data from bookings where id = ${body.id} limit 1`;
      const b = rows[0]?.data as Booking | undefined;
      if (!b || b.status !== body.status) return NextResponse.json({ ok: false, skipped: "status changed" });
      const listing = await sql`select data->>'title' as title, data->>'slug' as slug from listings where id = ${b.listingId} limit 1`;
      const home = (listing[0]?.title as string | undefined) ?? "your home";
      const link = listing[0]?.slug ? `\n${siteUrl}/apartments/${listing[0].slug}` : "";
      const stay = `${home}${link}\n${b.checkIn} to ${b.checkOut}`;
      const mail =
        b.status === "confirmed"
          ? { subject: `Your stay is confirmed | ${settings.siteName}`, text: `Hi ${b.guestName},\n\nGood news: your stay is confirmed.\n\n${stay}\n\nWe'll email move-in details shortly. Reply to this email with any questions.${sign}` }
          : b.status === "declined"
            ? { subject: `About your booking request | ${settings.siteName}`, text: `Hi ${b.guestName},\n\nThank you for your interest. Unfortunately we can't offer these dates:\n\n${stay}\n\nReply and we'll gladly suggest other homes or dates.${sign}` }
            : b.status === "cancelled"
              ? { subject: `Your stay was cancelled | ${settings.siteName}`, text: `Hi ${b.guestName},\n\nYour stay has been cancelled:\n\n${stay}\n\nReply to this email if this isn't what you expected.${sign}` }
              : null;
      if (!mail) return NextResponse.json({ ok: true, skipped: "status needs no email" });
      return NextResponse.json({ ok: await sendEmail({ to: b.email, replyTo: settings.supportEmail, ...mail }) });
    }

    const rows = await sql`select data from hosts where id = ${body.id} limit 1`;
    const h = rows[0]?.data as HostApplication | undefined;
    if (!h || h.status !== body.status) return NextResponse.json({ ok: false, skipped: "status changed" });
    const mail =
      h.status === "approved"
        ? { subject: `Welcome to ${settings.siteName}`, text: `Hi ${h.name},\n\nWe'd love to list ${h.address || "your space"}. Our team will contact you shortly to schedule photos and finalize details.${sign}` }
        : h.status === "rejected"
          ? { subject: `About your host application | ${settings.siteName}`, text: `Hi ${h.name},\n\nThank you for applying. We're not able to list ${h.address || "your space"} right now, but we'd be glad to hear from you again in future.${sign}` }
          : null;
    if (!mail) return NextResponse.json({ ok: true, skipped: "status needs no email" });
    return NextResponse.json({ ok: await sendEmail({ to: h.email, replyTo: settings.supportEmail, ...mail }) });
  } catch (e) {
    console.error("[admin/notify]", e);
    return NextResponse.json({ error: "Could not send" }, { status: 500 });
  }
}
