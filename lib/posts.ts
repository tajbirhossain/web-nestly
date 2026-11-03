import { cacheLife, cacheTag } from "next/cache";
import type { Post } from "@/lib/admin/types";
import { posts as samplePosts } from "@/lib/data";
import { dbEnabled, sql } from "@/lib/db";

export type PublicPost = { slug: string; title: string; excerpt: string; image: string; date: string; category: string; body: string[] };

// Public-site blog: only posts marked "published" in the admin. Falls back to the
// built-in sample posts when the database is not set up or still empty.
export async function getPosts(): Promise<PublicPost[]> {
  "use cache";
  cacheTag("posts");
  // `stale` must stay >= 5 min or Next treats this as dynamic and drops it from the prerender.
  cacheLife({ stale: 300, revalidate: 30, expire: 3600 });

  if (!dbEnabled) return samplePosts;
  try {
    const rows = (await sql`select data from posts order by created_at desc`).map((r) => r.data as Post);
    if (rows.length === 0) return samplePosts; // fresh project: admin has not seeded yet
    return rows
      .filter((p) => p.status === "published")
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        image: p.image || "/images/stock/nyc-neighborhood.jpg",
        date: p.date,
        category: p.category,
        body: p.body.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean),
      }));
  } catch (e) {
    console.error("[posts] database read failed, using sample posts:", e);
    return samplePosts;
  }
}

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug);
}
