import { neon } from "@neondatabase/serverless";

// Server-only. Neon's HTTP driver suits Next.js route handlers and cached functions
// (one stateless request per query, no connection pool to manage). Without
// DATABASE_URL the app falls back to its built-in sample data.
const url = process.env.DATABASE_URL;

export const dbEnabled = Boolean(url);
export const sql = neon(url ?? "postgres://unset:unset@localhost/unset");

/** Every table has the same shape: an id plus the record itself as JSON. */
export const COLLECTIONS = ["listings", "bookings", "inquiries", "hosts", "reviews", "posts"] as const;
export const TABLES = [...COLLECTIONS, "settings"] as const;
export type Table = (typeof TABLES)[number];
export const isTable = (t: unknown): t is Table => (TABLES as readonly unknown[]).includes(t);
