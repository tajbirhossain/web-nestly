"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

// "Sign in with Google" (Google Identity Services) then write a review. The ID token is verified on
// the server, so the email shown here is only a convenience; it cannot be faked to post as someone else.
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(cfg: { client_id: string; callback: (r: { credential: string }) => void }): void;
          renderButton(el: HTMLElement, opts: Record<string, unknown>): void;
          disableAutoSelect(): void;
        };
      };
    };
  }
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type Home = { slug: string; title: string };
type Profile = { name: string; email: string };

function decodeProfile(credential: string): Profile | null {
  try {
    const b64 = credential.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
    const p = JSON.parse(json) as { name?: string; email?: string };
    return p.email ? { name: p.name ?? p.email, email: p.email } : null;
  } catch {
    return null;
  }
}

export default function ReviewForm({ homes, fixedSlug }: { homes: Home[]; fixedSlug?: string }) {
  const buttonBox = useRef<HTMLDivElement>(null);
  const [gsiReady, setGsiReady] = useState(false);
  const [credential, setCredential] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [slug, setSlug] = useState(fixedSlug ?? "");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const profile = credential ? decodeProfile(credential) : null;

  useEffect(() => {
    if (!gsiReady || credential || !CLIENT_ID || !buttonBox.current || !window.google) return;
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: ({ credential: c }) => {
        setCredential(c);
        setError("");
      },
    });
    window.google.accounts.id.renderButton(buttonBox.current, { theme: "outline", size: "large", text: "signin_with", shape: "pill", width: 260 });
  }, [gsiReady, credential]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return setError("Please choose a star rating");
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential, rating, text, listingSlug: slug || undefined }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) setCredential(null); // token expired: ask them to sign in again
        throw new Error(json.error ?? "Something went wrong");
      }
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("idle");
    }
  }

  if (!CLIENT_ID) {
    return (
      <p className="rounded-2xl bg-soft p-5 text-sm text-muted">Guest reviews are opening soon. Thanks for your patience!</p>
    );
  }

  if (state === "done") {
    return (
      <div role="status" className="rounded-2xl bg-brand-tint p-7 text-center">
        <p className="font-serif text-2xl">Thank you for your review</p>
        <p className="mt-2 text-muted">It will appear on the site once our team has approved it.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setGsiReady(true)} />
      <h3 className="font-serif text-2xl">Share your experience</h3>
      <p className="mt-1 text-[15px] text-muted">Sign in with Google so we know every review comes from a real person. We never post your email.</p>

      {!credential ? (
        <div className="mt-5">
          <div ref={buttonBox} className="min-h-11" />
          {!gsiReady && <p className="text-sm text-muted">Loading Google sign-in…</p>}
          {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 grid gap-4">
          <p className="flex flex-wrap items-center gap-x-2 text-sm">
            Signed in as <strong className="font-medium">{profile?.name}</strong>
            <span className="text-muted">({profile?.email})</span>
            <button
              type="button"
              onClick={() => {
                window.google?.accounts.id.disableAutoSelect();
                setCredential(null);
              }}
              className="text-brand underline underline-offset-4"
            >
              Not you?
            </button>
          </p>

          {!fixedSlug && (
            <div>
              <label htmlFor="review-home" className="mb-1.5 block text-sm font-medium">Which home did you stay in?</label>
              <select id="review-home" className="field" value={slug} onChange={(e) => setSlug(e.target.value)}>
                <option value="">Nestly in general</option>
                {homes.map((h) => <option key={h.slug} value={h.slug}>{h.title}</option>)}
              </select>
            </div>
          )}

          <div>
            <p id="review-rating" className="mb-1.5 text-sm font-medium">Your rating <span className="text-brand">*</span></p>
            <div role="radiogroup" aria-labelledby="review-rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setRating(n)}
                  className={`text-3xl leading-none transition ${n <= (hover || rating) ? "text-amber-400" : "text-line"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="review-text" className="mb-1.5 block text-sm font-medium">Your review <span className="text-brand">*</span></label>
            <textarea
              id="review-text"
              className="field min-h-32"
              required
              minLength={20}
              maxLength={1500}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What was your stay like? The home, the neighborhood, the service…"
            />
            <p className="mt-1 text-right text-xs text-muted">{text.length}/1500</p>
          </div>

          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full disabled:opacity-60 sm:w-auto sm:justify-self-start">
            {state === "sending" ? "Sending…" : "Submit review"}
          </button>
        </form>
      )}
    </div>
  );
}
