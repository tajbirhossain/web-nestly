// Public base URL for absolute links (sitemap, emails). Set NEXT_PUBLIC_SITE_URL once a custom domain is live.
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://nestly.nyc")
).replace(/\/$/, "");
