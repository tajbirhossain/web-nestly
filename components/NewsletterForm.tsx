"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email");
    setState("sending");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newsletter", email }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") return <p role="status" className="text-[15px] text-white">Thanks — you&apos;re on the list.</p>;

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm">
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 p-1.5 pl-5 focus-within:border-white/60">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/50"
        />
        <button type="submit" disabled={state === "sending"} aria-label="Subscribe" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-brand-dark disabled:opacity-60">
          →
        </button>
      </div>
      {state === "error" && <p role="alert" className="mt-2 text-sm text-red-300">Something went wrong — please try again.</p>}
    </form>
  );
}
