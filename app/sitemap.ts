import type { MetadataRoute } from "next";
import { getApartments } from "@/lib/listings";
import { getPosts } from "@/lib/posts";
import { siteUrl } from "@/lib/site";

const pages = ["", "/apartments", "/neighborhoods", "/how-it-works", "/reviews", "/blog", "/corporate", "/relocation", "/become-a-host", "/about", "/faq", "/contact", "/privacy-policy", "/terms"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [apartments, posts] = await Promise.all([getApartments(), getPosts()]);
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...apartments.map((a) => ({ url: `${siteUrl}/apartments/${a.slug}`, changeFrequency: "daily" as const, priority: 0.9 })),
    ...posts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
