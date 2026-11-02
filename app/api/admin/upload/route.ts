import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// Demo-only image upload for the admin: no auth, so don't expose this publicly.
// The browser resizes photos before sending, so files stay well under Vercel's 4.5 MB request limit.
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image storage isn't set up yet: add a Blob store to the Vercel project and set BLOB_READ_WRITE_TOKEN." },
      { status: 503 },
    );
  }
  const file = (await req.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file received" }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG or WebP image" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image is larger than 4 MB" }, { status: 413 });

  try {
    const blob = await put(`listings/photo.${ext}`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
