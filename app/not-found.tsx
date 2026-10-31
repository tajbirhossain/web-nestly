import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-n flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <p className="kicker">404</p>
      <h1 className="mt-3 text-5xl">We couldn&apos;t find that page</h1>
      <p className="mt-4 text-muted">It may have moved. Let&apos;s get you back to a home.</p>
      <Link href="/apartments" className="btn btn-primary mt-8">Browse apartments</Link>
    </section>
  );
}
