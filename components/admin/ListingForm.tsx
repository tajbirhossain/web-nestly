"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { slugify, todayISO, uid } from "@/lib/admin/format";
import { actions, useDB } from "@/lib/admin/store";
import { uploadImage } from "@/lib/admin/upload";
import type { Listing, ListingStatus } from "@/lib/admin/types";
import { boroughs, cancellationInfo, featureFilters, type Borough, type Cancellation } from "@/lib/data";
import { useFeedback } from "./feedback";
import { Icon } from "./icons";
import LocationPicker from "./LocationPicker";
import { EmptyState, Field, PageHeader } from "./ui";

// Listings can use uploaded photos (Vercel Blob) or the site's built-in image library.
const library = [
  "nyc-apartment-living", "furnished-interior", "modern-workspace", "nyc-skyline-apt",
  "nyc-neighborhood", "apartment-main", "feature-img",
].map((n) => `/images/stock/${n}.jpg`);

const times = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6; // 6 AM – 10 PM
  return `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
});

type Form = {
  cleaningFee: string; securityDeposit: string; maxGuests: string; minGuestAge: string;
  checkInTime: string; checkOutTime: string; cancellation: Cancellation; specialInstructions: string;
  childrenAllowed: boolean; utilitiesIncluded: boolean; smokingAllowed: boolean; partiesAllowed: boolean;
  title: string; neighborhood: string; borough: Borough; beds: string; baths: string; sqft: string;
  price: string; availableFrom: string; status: ListingStatus; featured: boolean;
  images: string[]; description: string; amenities: string[];
  address: string; lat: number | null; lng: number | null;
};

const AREA_CENTER: Record<Borough, [number, number]> = {
  Manhattan: [40.7831, -73.9712],
  Bronx: [40.8448, -73.8648],
  Brooklyn: [40.6782, -73.9442],
  "New Jersey": [40.7178, -74.0431],
};

const blankForm = (): Form => ({
  cleaningFee: "200", securityDeposit: "", maxGuests: "2", minGuestAge: "18", checkInTime: "3:00 PM", checkOutTime: "11:00 AM",
  cancellation: "moderate", specialInstructions: "", childrenAllowed: true, utilitiesIncluded: true, smokingAllowed: false, partiesAllowed: false,
  title: "", neighborhood: "", borough: "Manhattan", beds: "1", baths: "1", sqft: "", price: "",
  availableFrom: todayISO(), status: "draft", featured: false, images: [], description: "", amenities: [],
  address: "", lat: null, lng: null,
});

const toForm = (l: Listing): Form => ({
  cleaningFee: String(l.cleaningFee), securityDeposit: String(l.securityDeposit), maxGuests: String(l.maxGuests), minGuestAge: String(l.minGuestAge),
  checkInTime: l.checkInTime, checkOutTime: l.checkOutTime, cancellation: l.cancellation, specialInstructions: l.specialInstructions,
  childrenAllowed: l.childrenAllowed, utilitiesIncluded: l.utilitiesIncluded, smokingAllowed: l.smokingAllowed, partiesAllowed: l.partiesAllowed,
  title: l.title, neighborhood: l.neighborhood, borough: l.borough, beds: String(l.beds), baths: String(l.baths),
  sqft: String(l.sqft), price: String(l.price), availableFrom: l.availableFrom, status: l.status,
  featured: l.featured, images: l.images, description: l.description, amenities: l.amenities,
  address: l.address ?? "", lat: l.lat ?? null, lng: l.lng ?? null,
});

/** Route wrapper: resolves /admin/listings/[id] (or "new") to the right form. */
export default function ListingEditor() {
  const { id } = useParams<{ id?: string }>();
  const db = useDB();
  if (!id) return <ListingForm key="new" />;
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) {
    return (
      <div className="a-card">
        <EmptyState icon="building" title="Listing not found" text="It may have been deleted." action={<Link href="/admin/listings" className="a-btn a-btn-primary">Back to listings</Link>} />
      </div>
    );
  }
  return <ListingForm key={listing.id} listing={listing} />;
}

function ListingForm({ listing }: { listing?: Listing }) {
  const router = useRouter();
  const { toast } = useFeedback();
  const db = useDB();
  const [f, setF] = useState<Form>(() => (listing ? toForm(listing) : blankForm()));
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const toggle = (k: "images" | "amenities", v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);
  const [uploading, setUploading] = useState(0);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files);
    setUploading((n) => n + list.length);
    const urls: string[] = [];
    for (const file of list) {
      try {
        urls.push(await uploadImage(file));
      } catch (err) {
        toast(err instanceof Error ? err.message : "Upload failed", "bad");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (urls.length) {
      setF((p) => ({ ...p, images: [...p.images, ...urls] }));
      setErrors((e) => ({ ...e, images: undefined }));
      toast(`${urls.length} photo${urls.length > 1 ? "s" : ""} uploaded`);
    }
  }

  function save(statusOverride?: ListingStatus) {
    const e: typeof errors = {};
    if (!f.title.trim()) e.title = "Add a title";
    if (!f.neighborhood.trim()) e.neighborhood = "Add a neighborhood";
    if (!(Number(f.price) > 0)) e.price = "Enter a monthly price";
    if (!(Number(f.sqft) > 0)) e.sqft = "Enter the size in sqft";
    const whole = (v: string, min: number, max = Infinity) => v.trim() !== "" && Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max;
    if (!whole(f.cleaningFee, 0)) e.cleaningFee = "Enter 0 or more";
    if (!whole(f.securityDeposit, 0)) e.securityDeposit = "Enter 0 or more";
    if (!whole(f.maxGuests, 1, 20)) e.maxGuests = "Enter 1–20";
    if (!whole(f.minGuestAge, 18, 99)) e.minGuestAge = "Enter 18–99";
    if (!f.images.length && (statusOverride ?? f.status) === "published") e.images = "Select at least one photo to publish";
    setErrors(e);
    if (Object.keys(e).length) {
      toast("Please fix the highlighted fields", "bad");
      return;
    }

    let slug = listing?.slug ?? slugify(f.title);
    if (!listing && db.listings.some((l) => l.slug === slug)) slug = `${slug}-${uid("").slice(1, 5)}`;
    const next: Listing = {
      address: f.address.trim() || undefined,
      lat: f.lat ?? undefined,
      lng: f.lng ?? undefined,
      highlights: listing?.highlights,
      id: listing?.id ?? slug,
      slug,
      title: f.title.trim(),
      neighborhood: f.neighborhood.trim(),
      borough: f.borough,
      beds: Number(f.beds),
      baths: Number(f.baths),
      sqft: Number(f.sqft),
      price: Number(f.price),
      availableFrom: f.availableFrom,
      status: statusOverride ?? f.status,
      featured: f.featured,
      childrenAllowed: f.childrenAllowed,
      cleaningFee: Number(f.cleaningFee),
      securityDeposit: Number(f.securityDeposit),
      utilitiesIncluded: f.utilitiesIncluded,
      maxGuests: Number(f.maxGuests),
      minGuestAge: Number(f.minGuestAge),
      smokingAllowed: f.smokingAllowed,
      partiesAllowed: f.partiesAllowed,
      checkInTime: f.checkInTime,
      checkOutTime: f.checkOutTime,
      cancellation: f.cancellation,
      specialInstructions: f.specialInstructions.trim(),
      images: f.images,
      description: f.description.trim(),
      amenities: f.amenities,
      updatedAt: new Date().toISOString(),
    };
    actions.upsert("listings", next);
    toast(listing ? "Listing saved" : "Listing created");
    router.push("/admin/listings");
  }

  const num = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label} error={errors[k]}>
      {(id) => <input id={id} type="number" min={0} className="a-input" value={f[k] as string} onChange={(e) => set(k, e.target.value as never)} {...props} />}
    </Field>
  );

  return (
    <>
      <Link href="/admin/listings" className="mb-3 inline-flex items-center gap-1 text-muted hover:text-foreground">
        <Icon name="chevron" size={14} className="rotate-180" /> Listings
      </Link>
      <PageHeader
        title={listing ? "Edit listing" : "New listing"}
        description={listing ? listing.title : "Fill in the details. You can save as a draft and publish later."}
        actions={
          <>
            <Link href="/admin/listings" className="a-btn a-btn-outline">Cancel</Link>
            {!listing && <button type="button" className="a-btn a-btn-outline" onClick={() => save("draft")}>Save as draft</button>}
            <button type="button" className="a-btn a-btn-primary" onClick={() => (listing ? save() : save("published"))}>
              {listing ? "Save changes" : "Publish"}
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="a-card grid gap-4 p-5 sm:grid-cols-2">
            <h2 className="text-lg sm:col-span-2">Basics</h2>
            <Field label="Title" error={errors.title} className="sm:col-span-2">
              {(id) => <input id={id} className="a-input" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Bright 2 Bedroom in the Upper East Side" />}
            </Field>
            <Field label="Neighborhood" error={errors.neighborhood}>
              {(id) => <input id={id} className="a-input" value={f.neighborhood} onChange={(e) => set("neighborhood", e.target.value)} />}
            </Field>
            <Field label="Area">
              {(id) => (
                <select id={id} className="a-input" value={f.borough} onChange={(e) => set("borough", e.target.value as Borough)}>
                  {boroughs.map((b) => <option key={b}>{b}</option>)}
                </select>
              )}
            </Field>
            <LocationPicker
              address={f.address}
              lat={f.lat}
              lng={f.lng}
              center={AREA_CENTER[f.borough]}
              state={f.borough === "New Jersey" ? "NJ" : "NY"}
              onAddress={(v) => set("address", v)}
              onPoint={(la, ln) => setF((p) => ({ ...p, lat: la, lng: ln }))}
            />
            <Field label="Description" className="sm:col-span-2" hint="Separate paragraphs with a blank line.">
              {(id) => <textarea id={id} className="a-input a-ta-md" value={f.description} onChange={(e) => set("description", e.target.value)} />}
            </Field>
          </section>

          <section className="a-card grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            <h2 className="col-span-full text-lg">Details & pricing</h2>
            <Field label="Bedrooms" hint="0 = studio">
              {(id) => <input id={id} type="number" min={0} max={10} className="a-input" value={f.beds} onChange={(e) => set("beds", e.target.value)} />}
            </Field>
            <Field label="Bathrooms">
              {(id) => <input id={id} type="number" min={1} max={10} step={0.5} className="a-input" value={f.baths} onChange={(e) => set("baths", e.target.value)} />}
            </Field>
            {num("sqft", "Size (sqft)")}
            {num("price", "Price / month ($)", { step: 50 })}
            <Field label="Available from" className="col-span-2">
              {(id) => <input id={id} type="date" className="a-input" value={f.availableFrom} onChange={(e) => set("availableFrom", e.target.value)} />}
            </Field>
          </section>

          <section className="a-card grid gap-4 p-5 sm:grid-cols-2">
            <h2 className="text-lg sm:col-span-2">Fees &amp; deposit</h2>
            <Field label="Cleaning fee ($)" error={errors.cleaningFee} hint="One-time, charged with the first month.">
              {(id) => <input id={id} type="number" min={0} step={25} className="a-input" value={f.cleaningFee} onChange={(e) => set("cleaningFee", e.target.value)} />}
            </Field>
            <Field label="Security deposit ($)" error={errors.securityDeposit} hint="Refundable. Held until move-out.">
              {(id) => (
                <div className="flex gap-2">
                  <input id={id} type="number" min={0} step={50} className="a-input" value={f.securityDeposit} onChange={(e) => set("securityDeposit", e.target.value)} />
                  <button type="button" className="a-btn a-btn-outline" disabled={!(Number(f.price) > 0)} onClick={() => set("securityDeposit", f.price)} title="Set to one month of rent">= Rent</button>
                </div>
              )}
            </Field>
            <label className="flex cursor-pointer items-start gap-3 sm:col-span-2">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--brand)]" checked={f.utilitiesIncluded} onChange={(e) => set("utilitiesIncluded", e.target.checked)} />
              <span><span className="block font-medium">Utilities &amp; Wi‑Fi included in rent</span><span className="text-muted">Uncheck if guests pay utilities separately.</span></span>
            </label>
          </section>

          <section className="a-card grid gap-4 p-5 sm:grid-cols-2">
            <h2 className="text-lg sm:col-span-2">Guests &amp; house rules</h2>
            <Field label="Maximum guests" error={errors.maxGuests} hint="Adults and children combined.">
              {(id) => <input id={id} type="number" min={1} max={20} className="a-input" value={f.maxGuests} onChange={(e) => set("maxGuests", e.target.value)} />}
            </Field>
            <Field label="Minimum age of primary guest" error={errors.minGuestAge} hint="For example 21 or 25 for some buildings.">
              {(id) => <input id={id} type="number" min={18} max={99} className="a-input" value={f.minGuestAge} onChange={(e) => set("minGuestAge", e.target.value)} />}
            </Field>
            <Field label="Check-in from">
              {(id) => <select id={id} className="a-input" value={f.checkInTime} onChange={(e) => set("checkInTime", e.target.value)}>{times.map((t) => <option key={t}>{t}</option>)}</select>}
            </Field>
            <Field label="Check-out by">
              {(id) => <select id={id} className="a-input" value={f.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)}>{times.map((t) => <option key={t}>{t}</option>)}</select>}
            </Field>
            <Field label="Cancellation policy" className="sm:col-span-2" hint={cancellationInfo[f.cancellation].text}>
              {(id) => (
                <select id={id} className="a-input" value={f.cancellation} onChange={(e) => set("cancellation", e.target.value as Cancellation)}>
                  {(Object.keys(cancellationInfo) as Cancellation[]).map((c) => <option key={c} value={c}>{cancellationInfo[c].label}</option>)}
                </select>
              )}
            </Field>
            <div className="grid gap-3 sm:col-span-2 sm:grid-cols-3">
              {([
                ["childrenAllowed", "Children allowed", "Off hides this home from searches with children and blocks them when booking."],
                ["smokingAllowed", "Smoking allowed", "Off shows “No smoking” on the listing."],
                ["partiesAllowed", "Parties allowed", "Off shows “No parties or events”."],
              ] as const).map(([k, label, hint]) => (
                <label key={k} className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--brand)]" checked={f[k]} onChange={(e) => set(k, e.target.checked)} />
                  <span><span className="block font-medium">{label}</span><span className="text-[13px] text-muted">{hint}</span></span>
                </label>
              ))}
            </div>
            <Field label="Special instructions" className="sm:col-span-2" hint="Shown prominently on the listing, e.g. quiet hours, ID at the front desk, walk-up building.">
              {(id) => <textarea id={id} className="a-input" value={f.specialInstructions} onChange={(e) => set("specialInstructions", e.target.value)} placeholder="e.g. Quiet hours 10 PM–8 AM. No smoking on the balcony." />}
            </Field>
          </section>

          <section className="a-card p-5">
            <h2 className="text-lg">Photos</h2>
            <p className="mb-3 text-muted">The first selected photo is the cover. Upload your own or pick from the image library; click a photo to select or deselect it.</p>
            <label className="a-btn a-btn-outline mb-3 cursor-pointer">
              <Icon name="plus" size={16} /> {uploading ? `Uploading ${uploading}…` : "Upload photos"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={uploading > 0}
                onChange={(e) => {
                  void onFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...f.images.filter((s) => !library.includes(s)), ...library].map((src) => {
                const idx = f.images.indexOf(src);
                const on = idx >= 0;
                return (
                  <button
                    key={src}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle("images", src)}
                    className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 ${on ? "border-brand" : "border-transparent"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {on && (
                      <span className="absolute left-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-brand px-1 text-xs font-semibold text-white">
                        {idx === 0 ? "Cover" : idx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {errors.images && <p className="a-error">{errors.images}</p>}
          </section>

          <section className="a-card p-5">
            <h2 className="mb-3 text-lg">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {[...new Set([...featureFilters, ...f.amenities])].map((a) => {
                const on = f.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle("amenities", a)}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium ${
                      on ? "border-brand bg-brand-tint text-brand-dark" : "border-line bg-white text-muted hover:text-foreground"
                    }`}
                  >
                    {on && <Icon name="check" size={13} />} {a}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          <section className="a-card p-5">
            <h2 className="mb-3 text-lg">Visibility</h2>
            <Field label="Status">
              {(id) => (
                <select id={id} className="a-input" value={f.status} onChange={(e) => set("status", e.target.value as ListingStatus)}>
                  <option value="published">Published — visible on site</option>
                  <option value="draft">Draft — hidden</option>
                  <option value="archived">Archived — hidden</option>
                </select>
              )}
            </Field>
            <label className="mt-4 flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[var(--brand)]" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />
              <span>
                <span className="block font-medium">Featured listing</span>
                <span className="text-muted">Show on the homepage and top of search.</span>
              </span>
            </label>
          </section>
          {listing && (
            <p className="px-1 text-xs text-muted">Public URL: /apartments/{listing.slug}</p>
          )}
        </aside>
      </div>
    </>
  );
}
