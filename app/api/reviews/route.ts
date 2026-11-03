import { NextResponse, after } from "next/server";
import type { Review } from "@/lib/admin/types";
import { dbEnabled, sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { googleClientId, publicName, verifyGoogleCredential } from "@/lib/googleAuth";
import { fetchSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";

// Guests write reviews after signing in with Google. Every review arrives as "pending" and only
// shows on the site once approved in the admin, so a verified email is the only gate needed here.
const MAX_PER_DAY = 3;

type Body = { credential?: string; rating?: number; text?: string; listingSlug?: string };

export async function POST(req: Request) {
  if (!googleClientId) {
    return NextResponse.json({ error: "Reviews aren't available yet: Google sign-in isn't set up." }, { status: 503 });
  }
  if (!dbEnabled) return NextResponse.json({ error: "Reviews aren't available right now." }, { status: 503 });

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const user = await verifyGoogleCredential(body.credential);
  if (!user) return NextResponse.json({ error: "Your Google sign-in expired. Please sign in again." }, { status: 401 });

  const rating = Number(body.rating);
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: "Choose a star rating" }, { status: 422 });
  if (text.length < 20) return NextResponse.json({ error: "Please write at least a couple of sentences (20+ characters)" }, { status: 422 });
  if (text.length > 1500) return NextResponse.json({ error: "Please keep your review under 1,500 characters" }, { status: 422 });

  try {
    // Which home is it about? (optional: guests can also review Nestly in general)
    let slug: string | undefined;
    let title: string | undefined;
    if (body.listingSlug) {
      const rows = await sql`select id, data->>'title' as title, data->>'slug' as slug from listings where data->>'slug' = ${body.listingSlug} limit 1`;
      if (!rows[0]) return NextResponse.json({ error: "We couldn't find that home" }, { status: 404 });
      slug = rows[0].slug as string;
      title = rows[0].title as string;
    }

    // One review per person per home, and a daily cap so one account can't flood the queue.
    const mine = (await sql`select data from reviews where lower(data->>'email') = ${user.email}`).map((r) => r.data as Review);
    if (mine.some((r) => (r.listingSlug ?? "") === (slug ?? ""))) {
      return NextResponse.json({ error: slug ? "You've already reviewed this home. Thank you!" : "You've already shared your feedback about Nestly. Thank you!" }, { status: 409 });
    }
    const dayAgo = Date.now() - 86_400_000;
    if (mine.filter((r) => Date.parse(r.createdAt) > dayAgo).length >= MAX_PER_DAY) {
      return NextResponse.json({ error: "You've sent a few reviews today. Please try again tomorrow." }, { status: 429 });
    }

    // "Verified stay" = this email has a confirmed booking for the home.
    let verifiedStay = false;
    if (slug) {
      const stays = await sql`
        select 1 from bookings
        where data->>'status' = 'confirmed' and lower(data->>'email') = ${user.email}
          and (data->>'listingId' = ${slug} or data->>'listingId' in (select id from listings where data->>'slug' = ${slug}))
        limit 1`;
      verifiedStay = stays.length > 0;
    }

    const review: Review = {
      id: `rv_${Math.random().toString(36).slice(2, 9)}`,
      name: publicName(user.name),
      stay: title ? `Stayed in ${title}` : "Nestly guest",
      rating,
      text,
      status: "pending",
      createdAt: new Date().toISOString(),
      listingSlug: slug,
      email: user.email,
      verifiedStay,
    };
    await sql.query(`insert into reviews (id, data) values ($1, $2::jsonb)`, [review.id, JSON.stringify(review)]);

    after(async () => {
      const s = await fetchSettings();
      if (!s.notifyInquiries || !s.supportEmail) return;
      await sendEmail({
        to: s.supportEmail,
        subject: `New review awaiting approval: ${rating}/5${title ? ` for ${title}` : ""}`,
        text: `${review.name} (${user.email})${verifiedStay ? ", verified stay" : ""}\n${"★".repeat(rating)}${"☆".repeat(5 - rating)}\n\n${text}\n\nApprove or hide it here: ${siteUrl}/admin/reviews`,
      });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[reviews]", e);
    return NextResponse.json({ error: "We couldn't save your review. Please try again." }, { status: 500 });
  }
}
