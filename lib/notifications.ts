import { sendEmail } from "@/lib/email";
import type { SiteSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";

type Body = Record<string, string>;

const LABEL: Record<string, string> = {
  booking: "Booking request",
  host: "Host application",
  contact: "Contact message",
  corporate: "Corporate inquiry",
  relocation: "Relocation inquiry",
  newsletter: "Newsletter signup",
};

const lines = (rows: [string, string | undefined][]) =>
  rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n");

/** Emails the team (per the admin's notification toggles) and sends the guest a short acknowledgement. */
export async function notifySubmission(type: string, body: Body, name: string, settings: SiteSettings) {
  const enabled = type === "booking" ? settings.notifyBookings : type === "host" ? settings.notifyHosts : settings.notifyInquiries;
  const label = LABEL[type] ?? "New request";
  const details = lines([
    ["Name", name],
    ["Email", body.email],
    ["Phone", body.phone],
    ["Company", body.company],
    ["Home", body.apartment ? `${siteUrl}/apartments/${body.apartment}` : undefined],
    ["Dates", body.movein && body.moveout ? `${body.movein} to ${body.moveout}` : undefined],
    ["Guests", body.adults ? `${body.adults} adult(s), ${body.children || 0} child(ren)` : undefined],
    ["Address", body.address],
    ["Area", body.borough],
    ["Expected rent", body.rent],
    ["Topic", body.topic],
  ]);

  const jobs: Promise<unknown>[] = [];
  if (enabled && settings.supportEmail) {
    jobs.push(
      sendEmail({
        to: settings.supportEmail,
        subject: `${label} from ${name || body.email}`,
        text: `${details}\n\n${body.message ? `Message:\n${body.message}\n\n` : ""}Open the admin to respond: ${siteUrl}/admin`,
        replyTo: body.email,
      }),
    );
  }
  if (type !== "newsletter" && body.email) {
    const intro =
      type === "booking"
        ? "We've received your booking request. We'll check availability and email you to confirm your stay."
        : type === "host"
          ? "Thanks for your interest in hosting with us. Our team will review your space and get back to you."
          : "Thanks for getting in touch. We'll reply as soon as we can.";
    jobs.push(
      sendEmail({
        to: body.email,
        subject: `We received your request | ${settings.siteName}`,
        text: `Hi ${name || "there"},\n\n${intro}\n\nWhat you sent us:\n${details}\n\nReply to this email if anything needs to change.\n\n${settings.siteName}`,
        replyTo: settings.supportEmail,
      }),
    );
  }
  await Promise.all(jobs);
}
