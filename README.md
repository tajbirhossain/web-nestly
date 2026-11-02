This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database (Neon)

The demo runs on a Neon Postgres project (see `neon.ts`). The Neon CLI is a devDependency, so use `npx neon ...`.

1. `npx neon login`, then `npx neon env pull` to write `DATABASE_URL` to `.env.local`.
2. `npm run db:setup` creates the tables (`db/schema.sql`).
3. Run `npm run dev`, open `/admin` and sign in. The first load seeds the demo data.

Without `DATABASE_URL` the site runs on built-in sample data and admin edits stay in the browser. There is no auth: the `/api/admin/db` endpoint is open, so demo only.

## Photo uploads (Vercel Blob)

The admin listing form uploads photos to Vercel Blob (resized in the browser to 1800px first).

1. Vercel dashboard → your project → Storage → Create a Blob store (public) and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`.
2. Locally: `npx vercel env pull .env.local` (or paste the token into `.env.local`).
3. On Vercel, also make sure `DATABASE_URL` is set for the project (the Neon integration can add it).

Without the token, uploads show a clear error and the built-in image library still works.
