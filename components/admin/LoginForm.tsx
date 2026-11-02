"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_LOGIN, signIn, useSession } from "@/lib/admin/store";
import { Field } from "./ui";

export default function LoginForm() {
  const router = useRouter();
  const session = useSession();
  const [email, setEmail] = useState(DEMO_LOGIN.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (session) router.replace("/admin");
  }, [session, router]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!signIn(email, password)) {
      setError("That email or password isn't right.");
      return;
    }
    router.replace("/admin");
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image src="/images/brand/logo.png" alt="Nestly" width={130} height={38} className="h-9 w-auto" priority />
          <div>
            <h1 className="text-2xl">Admin sign in</h1>
            <p className="mt-1 text-muted">Manage listings, bookings and content.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="a-card flex flex-col gap-4 p-6" noValidate>
          <Field label="Email">
            {(id) => (
              <input id={id} type="email" className="a-input" autoComplete="username" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
            )}
          </Field>
          <Field label="Password" error={error}>
            {(id) => (
              <input id={id} type="password" className="a-input" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoFocus />
            )}
          </Field>
          <button type="submit" className="a-btn a-btn-primary w-full">Sign in</button>
        </form>

        <p className="mt-4 rounded-xl bg-brand-tint px-4 py-3 text-center text-[13px] text-brand-dark">
          Demo mode — password is <code className="font-semibold">{DEMO_LOGIN.password}</code>. Real authentication comes with the database.
        </p>
      </div>
    </div>
  );
}
