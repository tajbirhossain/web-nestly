import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CtaBand } from "@/components/sections";
import { posts } from "@/lib/data";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.excerpt } : {};
}

// Reading `params` must happen inside <Suspense> so the shared App Shell isn't tied to one URL.
export default function PostPage({ params }: PageProps<"/blog/[slug]">) {
  return (
    <Suspense fallback={<PostSkeleton />}>
      <Post params={params} />
    </Suspense>
  );
}

function PostSkeleton() {
  return (
    <div aria-hidden className="container-n max-w-3xl animate-pulse pb-20 pt-32">
      <div className="h-4 w-24 rounded bg-soft" />
      <div className="mt-6 h-12 w-3/4 rounded-xl bg-soft" />
      <div className="my-10 aspect-[16/9] rounded-3xl bg-soft" />
      <div className="space-y-4">
        <div className="h-5 rounded bg-soft" />
        <div className="h-5 w-11/12 rounded bg-soft" />
        <div className="h-5 w-4/5 rounded bg-soft" />
      </div>
    </div>
  );
}

async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <>
      <article className="container-n max-w-3xl pb-20 pt-32">
        <Link href="/blog" className="text-sm text-muted hover:text-ink">← All articles</Link>
        <p className="kicker mt-6">{post.category}</p>
        <h1 className="mt-2 text-[clamp(32px,5vw,52px)] leading-[1.1]">{post.title}</h1>
        <p className="mt-3 text-sm text-muted">{post.date}</p>
        <div className="relative my-10 aspect-[16/9] overflow-hidden rounded-3xl">
          <Image src={post.image} alt="" fill priority sizes="768px" className="object-cover" />
        </div>
        <div className="space-y-6 text-[18px] leading-8 text-muted">
          {post.body.map((p, i) =>
            p.startsWith("## ") ? (
              <h2 key={i} className="!mt-10 text-2xl text-ink">{p.slice(3)}</h2>
            ) : (
              <p key={i}>{p}</p>
            ),
          )}
        </div>
      </article>
      <CtaBand title="Find your Nestly home" text="Furnished apartments for 30+ day stays across NYC." href="/apartments" label="Browse apartments" />
    </>
  );
}
