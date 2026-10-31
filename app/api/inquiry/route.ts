import { NextResponse } from "next/server";

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
  // TODO: deliver to hello@nestly.nyc (Resend/SMTP) or store in a CRM.
  console.log("[inquiry]", type, { name, email });
  return NextResponse.json({ ok: true });
}
