// Transactional email through Resend's HTTP API (no SDK needed). Set RESEND_API_KEY and
// EMAIL_FROM (e.g. "Nestly <bookings@yourdomain.com>", a domain verified in Resend).
// Without them nothing is sent and the message is only logged, so local dev and demos keep working.

export const emailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export type Mail = { to: string; subject: string; text: string; replyTo?: string };

/** Never throws: a failed email must not fail the request that triggered it. */
export async function sendEmail(mail: Mail): Promise<boolean> {
  if (!emailEnabled) {
    console.log(`[email] not configured, skipped: "${mail.subject}" -> ${mail.to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [mail.to], subject: mail.subject, text: mail.text, reply_to: mail.replyTo }),
    });
    if (!res.ok) {
      console.error("[email] Resend rejected the message:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email] send failed:", e);
    return false;
  }
}
