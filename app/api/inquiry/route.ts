import { NextResponse } from "next/server";
import { allowsChildren, getApartment, termsOf } from "@/lib/data";

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
    const apt = body.apartment ? getApartment(body.apartment) : undefined;
    if (children > 0 && apt && !allowsChildren(apt)) {
      return NextResponse.json({ error: "This home does not allow children" }, { status: 422 });
    }
    if (apt && adults + children > termsOf(apt).maxGuests) {
      return NextResponse.json({ error: `This home sleeps up to ${termsOf(apt).maxGuests} guests` }, { status: 422 });
    }
  }
  // TODO: deliver to hello@nestly.nyc (Resend/SMTP) or store in a CRM.
  console.log("[inquiry]", type, { name, email });
  return NextResponse.json({ ok: true });
}
