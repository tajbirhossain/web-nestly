import type { Booking, HostApplication, Inquiry, InquiryType } from "@/lib/admin/types";
import { dbEnabled, sql, type Table } from "@/lib/db";

// Stores public-form submissions in the same tables the admin reads.
type Body = Record<string, string>;

const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
const now = () => new Date().toISOString();

async function insert(table: Table, record: { id: string }) {
  // Table comes from our own call sites below, never from user input.
  await sql.query(`insert into ${table} (id, data) values ($1, $2::jsonb)`, [record.id, JSON.stringify(record)]);
  return true;
}

/** Admin bookings point at a listing id; the form only knows the slug. */
async function listingIdFor(slug: string) {
  const rows = await sql`select id from listings where data->>'slug' = ${slug} limit 1`;
  return (rows[0]?.id as string | undefined) ?? slug;
}

const bedsFrom = (v = "") => (/studio/i.test(v) ? 0 : Number.parseInt(v, 10) || 1);

/** Returns true when the submission was stored in the database, false when no database is configured. */
export async function saveSubmission(type: string, body: Body, name: string): Promise<boolean> {
  if (!dbEnabled) return false;
  const email = body.email.trim();
  const phone = body.phone ?? "";

  if (type === "booking") {
    const booking: Booking = {
      id: id("bk"),
      guestName: name,
      email,
      phone,
      listingId: body.apartment ? await listingIdFor(body.apartment) : "",
      checkIn: body.movein ?? "",
      checkOut: body.moveout ?? "",
      adults: Number(body.adults || 0) || 1,
      children: Number(body.children || 0),
      status: "new",
      message: body.message ?? "",
      notes: "",
      createdAt: now(),
    };
    return insert("bookings", booking);
  }

  if (type === "host") {
    const host: HostApplication = {
      id: id("ho"),
      name,
      email,
      phone,
      address: body.address ?? "",
      borough: "Manhattan",
      beds: bedsFrom(body.beds),
      expectedRent: Number((body.rent ?? "").replace(/[^\d]/g, "")) || 0,
      message: body.message ?? "",
      status: "pending",
      createdAt: now(),
    };
    return insert("hosts", host);
  }

  const details = [
    body.topic && `Topic: ${body.topic}`,
    body.headcount && `Team size: ${body.headcount}`,
    body.movein && body.moveout && `Dates: ${body.movein} → ${body.moveout}`,
    body.phone && `Phone: ${body.phone}`,
  ].filter(Boolean);
  const inquiry: Inquiry = {
    id: id("iq"),
    type: type as InquiryType,
    name: name || email,
    email,
    company: body.company || undefined,
    message: [body.message, ...details].filter(Boolean).join("\n\n"),
    status: "new",
    createdAt: now(),
  };
  return insert("inquiries", inquiry);
}
