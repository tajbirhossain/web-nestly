import { NextResponse } from "next/server";
import { allowsChildren, termsOf } from "@/lib/data";
import { getApartment } from "@/lib/listings";
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
  } catch (e) {
    console.error("[inquiry] could not store submission:", e);
    return NextResponse.json({ error: "We couldn't save your request. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
