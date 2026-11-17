import { NextResponse } from "next/server";
import {
  SESSION_TTL_SECONDS,
  adminLoginConfigured,
  checkCredentials,
  createSessionToken,
  isAdminRequest,
  sessionCookie,
} from "@/lib/adminAuth";

// Admin sign-in / sign-out. Sets the HttpOnly session cookie the other /api/admin routes require.

export async function GET(req: Request) {
  return NextResponse.json({ authenticated: isAdminRequest(req) });
}

export async function POST(req: Request) {
  if (!adminLoginConfigured()) {
    return NextResponse.json({ error: "Admin login isn't configured. Set ADMIN_PASSWORD on the server." }, { status: 503 });
  }
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  if (!body || !checkCredentials(body.email, body.password)) {
    return NextResponse.json({ error: "That email or password isn't right." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie(createSessionToken(), SESSION_TTL_SECONDS));
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookie("", 0));
  return res;
}
