// Verifies a "Sign in with Google" ID token on the server. Needs only the public OAuth client ID
// (NEXT_PUBLIC_GOOGLE_CLIENT_ID); no client secret. Google's tokeninfo endpoint checks the signature and expiry.

export const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export type GoogleUser = { email: string; name: string; sub: string };

export async function verifyGoogleCredential(credential: unknown): Promise<GoogleUser | null> {
  if (!googleClientId || typeof credential !== "string" || credential.length < 20 || credential.length > 4096) return null;
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const t = (await res.json()) as Record<string, string>;
    const issuerOk = t.iss === "accounts.google.com" || t.iss === "https://accounts.google.com";
    // The token must be issued to OUR client ID, from Google, unexpired, with a verified email.
    if (t.aud !== googleClientId || !issuerOk || Number(t.exp) * 1000 < Date.now() || String(t.email_verified) !== "true" || !t.email) return null;
    return { email: t.email.toLowerCase(), name: t.name || t.email.split("@")[0], sub: t.sub };
  } catch {
    return null;
  }
}

/** "Priya Raman" -> "Priya R." so reviews never publish a full name. */
export function publicName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? "Guest";
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}
