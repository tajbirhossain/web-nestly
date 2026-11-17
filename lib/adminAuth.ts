import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

// Server-side admin sessions. The admin APIs (/api/admin/*) can rewrite listing prices
// and bookings, so every one of them checks this signed, HttpOnly cookie. The old
// browser-only flag in localStorage is kept just for UI state; it grants nothing.
//
// Configure in production (Vercel env):
//   ADMIN_PASSWORD        required — admin login is disabled in production without it
//   ADMIN_EMAIL           optional — defaults to admin@nestly.nyc
//   ADMIN_SESSION_SECRET  optional — signing key; defaults to one derived from ADMIN_PASSWORD
// In local development without ADMIN_PASSWORD the demo login below still works.

export const ADMIN_COOKIE = "nestly_admin";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;
const DEMO = { email: "admin@nestly.nyc", password: "nestly-admin" };

type Creds = { email: string; password: string };

function credentials(): Creds | null {
  const password = process.env.ADMIN_PASSWORD;
  if (password) return { email: (process.env.ADMIN_EMAIL || DEMO.email).trim().toLowerCase(), password };
  return process.env.NODE_ENV === "production" ? null : DEMO;
}

/** Signing key. Without a configured secret, dev uses a random per-process key (kept across hot reloads). */
function signingKey(): Buffer | null {
  if (process.env.ADMIN_SESSION_SECRET) return Buffer.from(process.env.ADMIN_SESSION_SECRET);
  if (process.env.ADMIN_PASSWORD) return createHash("sha256").update(`nestly-admin-session:${process.env.ADMIN_PASSWORD}`).digest();
  if (process.env.NODE_ENV === "production") return null;
  const g = globalThis as { __nestlyAdminKey?: Buffer };
  return (g.__nestlyAdminKey ??= randomBytes(32));
}

const sha = (s: string) => createHash("sha256").update(s).digest();
const sameText = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));

export const adminLoginConfigured = () => credentials() !== null;

export function checkCredentials(email: unknown, password: unknown): boolean {
  const c = credentials();
  if (!c || typeof email !== "string" || typeof password !== "string") return false;
  // Evaluate both comparisons so timing doesn't reveal which one failed.
  const okEmail = sameText(email.trim().toLowerCase(), c.email);
  const okPassword = sameText(password, c.password);
  return okEmail && okPassword;
}

const sign = (key: Buffer, payload: string) => createHmac("sha256", key).update(payload).digest("base64url");

export function createSessionToken(now = Date.now()): string {
  const key = signingKey();
  if (!key) throw new Error("Admin login is not configured");
  const exp = String(Math.floor(now / 1000) + SESSION_TTL_SECONDS);
  return `${exp}.${sign(key, exp)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  const key = signingKey();
  if (!key || !token) return false;
  const [exp, mac, extra] = token.split(".");
  if (!exp || !mac || extra !== undefined || !/^\d+$/.test(exp)) return false;
  if (Number(exp) * 1000 <= now) return false;
  const expected = Buffer.from(sign(key, exp));
  const given = Buffer.from(mac);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

export const isAdminRequest = (req: Request) => verifySessionToken(readCookie(req, ADMIN_COOKIE));

/** Returns a 401 response when the request has no valid admin session, otherwise null. */
export function requireAdmin(req: Request): NextResponse | null {
  return isAdminRequest(req) ? null : NextResponse.json({ error: "Please sign in again", auth: false }, { status: 401 });
}

export const sessionCookie = (value: string, maxAge: number) => ({
  name: ADMIN_COOKIE,
  value,
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/api/admin",
  maxAge,
});
