import { NextResponse, after } from "next/server";
import { allowsChildren, termsOf } from "@/lib/data";
import { fetchBookedRanges, overlaps } from "@/lib/availability";
import { getApartment } from "@/lib/listings";
import { notifySubmission } from "@/lib/notifications";
import { fetchSettings } from "@/lib/settings";
import { saveSubmission } from "@/lib/submissions";

const allowed = new Set(["contact", "booking", "host", "corporate", "relocation", "newsletter"]);

export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { type, email, message } = body;
  const name = (body.name ?? [body.firstName, body.lastName].filter(Boolean).join(" ")).trim();
  if (!allowed.has(type) || (type !== "newsletter" && !name) || !/^\S+@\S+\.\S+$/.test(email ?? "")) {
    return NextResponse.json({ error: "A name (where requested) and a valid email are required" }, { status: 422 });
  }
  if (typeof message === "string" && message.length > 5000) {
    return NextResponse.json({ error: "Message too long" }, { status: 422 });
  }
  // Bookings carry an adults/children split; refuse children on homes that do not allow them.
  if (type === "booking") {
    const adults = Number(body.adults || 0);
    const children = Number(body.children || 0);
    if (![adults, children].every((n) => Number.isInteger(n) && n >= 0 && n <= 10)) {
      return NextResponse.json({ error: "Invalid guest count" }, { status: 422 });
    }
    // Booking rules come from the admin settings and confirmed bookings, checked fresh on every request.
    const settings = await fetchSettings();
    if (!settings.bookingsOpen) {
      return NextResponse.json({ error: "We're not taking new booking requests right now. Please contact us and we'll help." }, { status: 403 });
    }
    const { movein, moveout } = body;
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    if (!iso.test(movein ?? "") || !iso.test(moveout ?? "") || moveout <= movein) {
      return NextResponse.json({ error: "Please choose valid check-in and check-out dates" }, { status: 422 });
    }
    const nights = Math.round((Date.parse(moveout) - Date.parse(movein)) / 86_400_000);
    if (nights < settings.minStayDays) {
      return NextResponse.json({ error: `The minimum stay is ${settings.minStayDays} nights` }, { status: 422 });
    }
    if (body.apartment && overlaps(await fetchBookedRanges(body.apartment), movein, moveout)) {
      return NextResponse.json({ error: "Those dates were just booked. Please choose different dates." }, { status: 409 });
    }
    const apt = body.apartment ? await getApartment(body.apartment) : undefined;
    if (children > 0 && apt && !allowsChildren(apt)) {
      return NextResponse.json({ error: "This home does not allow children" }, { status: 422 });
    }
    if (apt && adults + children > termsOf(apt).maxGuests) {
      return NextResponse.json({ error: `This home sleeps up to ${termsOf(apt).maxGuests} guests` }, { status: 422 });
    }
  }
  // Stored in the database so it shows up in the admin. TODO: also email hello@nestly.nyc (Resend/SMTP).
  try {
    const stored = await saveSubmission(type, body, name);
    if (!stored) console.log("[inquiry] no database configured, not stored:", type, { name, email });
    // Email after the response is sent so the guest never waits on the mail provider.
    after(async () => notifySubmission(type, body, name, await fetchSettings()));
  } catch (e) {
    console.error("[inquiry] could not store submission:", e);
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
