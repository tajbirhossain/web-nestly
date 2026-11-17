"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useMinNights } from "@/components/BookingRules";
import InquiryForm from "@/components/InquiryForm";
import Modal from "@/components/ui/Modal";
import { DatesPicker, GuestsPicker, guestLabel, guestTotal, noGuests } from "@/components/ui/Pickers";
import { fmtShort, fromISO, nightsBetween } from "@/components/ui/dates";
import { money, type Terms } from "@/lib/data";
import { fmtCents, fmtMonth, quoteStay, type MonthlyPrices } from "@/lib/pricing";

export default function BookingCard({
  slug,
  title,
  price,
  monthlyPrices,
  availableFrom,
  childrenAllowed = true,
  terms,
  blocked = [],
  bookingsOpen = true,
}: {
  slug: string;
  title: string;
  /** Base monthly price. */
  price: number;
  /** Custom prices for specific months ("YYYY-MM"). */
  monthlyPrices?: MonthlyPrices;
  availableFrom: string;
  childrenAllowed?: boolean;
  terms: Pick<Terms, "cleaningFee" | "securityDeposit" | "maxGuests" | "minGuestAge">;
  /** Confirmed stays on this home; their dates cannot be picked. */
  blocked?: { start: string; end: string }[];
  /** False when the admin has paused new booking requests. */
  bookingsOpen?: boolean;
}) {
  const minNights = useMinNights();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [picked, setGuests] = useState(noGuests);
  // Homes that block children always book with zero children, whatever was picked.
  const guests = childrenAllowed ? picked : { ...picked, children: 0 };
  const [open, setOpen] = useState(false);
  const picker = useRef<HTMLDivElement>(null);

  const nights = start && end ? nightsBetween(fromISO(start), fromISO(end)) : 0;
  // Display estimate only, using the same calculation as the server. The booking API
  // re-prices the stay from the stored listing; nothing priced here is ever sent.
  const quote = useMemo(() => {
    if (!start || !end || nights < 1) return null;
    try {
      return quoteStay({ price, monthlyPrices, cleaningFee: terms.cleaningFee }, start, end);
    } catch {
      return null;
    }
  }, [price, monthlyPrices, terms.cleaningFee, start, end, nights]);
  const hasCustomPrices = Object.keys(monthlyPrices ?? {}).length > 0;

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_10px_30px_rgba(23,24,25,.08)]">
        <p className="text-sm text-muted">
          Available from <strong className="font-medium text-ink">{fmtShort(availableFrom)}</strong>
        </p>
        <p className="mt-2 font-serif text-3xl">
          {money(price)}
          <span className="font-sans text-base font-normal text-muted"> / month</span>
        </p>
        {hasCustomPrices && <p className="mt-1 text-xs text-muted">Rates vary for some months. Add dates to see your price.</p>}

        <div ref={picker} className="mt-4 space-y-2.5">
          <DatesPicker start={start} end={end} blocked={blocked} onChange={(s, e) => { setStart(s); setEnd(e); }} variant="field" placeholder="Select dates" align="right" panelClass="w-[720px]" />
          <GuestsPicker value={guests} onChange={setGuests} variant="field" placeholder="Guests" align="right" childPolicy={childrenAllowed ? "allow" : "blocked"} max={terms.maxGuests} />
          {!childrenAllowed && <p className="px-1 text-xs text-muted">Adults only — this home doesn&apos;t allow children.</p>}
          <p className="px-1 text-xs text-muted">Sleeps up to {terms.maxGuests} · primary guest {terms.minGuestAge}+</p>
        </div>

        {nights >= minNights && quote ? (
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">{fmtShort(start)} – {fmtShort(end)}</dt><dd>{nights} nights</dd></div>
            {quote.segments.map((s) => (
              <div key={s.month} className="flex justify-between gap-3">
                <dt className="text-muted">
                  {fmtMonth(s.month)} · {s.nights === s.daysInMonth ? "full month" : `${s.nights} night${s.nights > 1 ? "s" : ""}`} at {fmtCents(s.monthlyRateCents)}/mo
                </dt>
                <dd className="whitespace-nowrap">{fmtCents(s.amountCents)}</dd>
              </div>
            ))}
            <div className="flex justify-between"><dt className="text-muted">Cleaning fee (one-time)</dt><dd>{fmtCents(quote.cleaningFeeCents)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 font-medium"><dt>Estimated total</dt><dd className="font-serif text-lg">{fmtCents(quote.totalCents)}</dd></div>
            <div className="flex justify-between rounded-xl bg-soft px-3 py-2"><dt className="text-muted">Refundable security deposit</dt><dd className="font-medium">{money(terms.securityDeposit)}</dd></div>
            <p className="text-xs text-muted">The deposit is held separately and returned after move-out if there is no damage. Utilities &amp; Wi‑Fi typically included. Nestly confirms the final total with you — nothing is charged online.</p>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted">Add your dates to see an estimated total.</p>
        )}

        <button
          type="button"
          disabled={!bookingsOpen}
          onClick={() => (nights >= minNights ? setOpen(true) : picker.current?.querySelector("button")?.click())}
          className="btn btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!bookingsOpen ? "Booking requests paused" : nights >= minNights ? "Request to book" : "Add dates to see prices"}
        </button>
        {!bookingsOpen && (
          <p role="status" className="mt-3 rounded-xl bg-soft px-3 py-2 text-center text-xs text-muted">
            We&apos;re not taking new booking requests right now. <Link href="/contact" className="font-medium text-brand underline underline-offset-4">Contact us</Link> and we&apos;ll help.
          </p>
        )}
        <p className="mt-3 rounded-xl bg-brand-tint px-3 py-2 text-center text-xs font-medium text-brand">Book direct &amp; save up to 20% — no third-party platform fees.</p>
        <p className="mt-2 text-center text-xs text-muted">Request to book — we confirm availability personally.</p>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 text-sm">
        <span className="font-medium">Any questions?</span>
        <Link href="/contact" className="font-medium text-brand underline underline-offset-4">Message us</Link>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Request to book">
        <p className="mb-5 rounded-2xl bg-brand-tint p-4 text-sm">
          <strong className="font-medium">{title}</strong>
          <br />
          {fmtShort(start || availableFrom)} – {end ? fmtShort(end) : "—"} · {nights} nights{guestTotal(guests) ? ` · ${guestLabel(guests)}` : ""}{quote ? ` · est. ${fmtCents(quote.totalCents)}` : ""}
        </p>
        <InquiryForm
          type="booking"
          submitLabel="Send request"
          extra={{ apartment: slug, movein: start, moveout: end, guests: String(guestTotal(guests) || ""), adults: String(guests.adults || ""), children: String(guests.children || "") }}
          successText="We'll review availability and email you to finalize your stay."
          fields={[
            { name: "firstName", label: "First name", required: true, half: true },
            { name: "lastName", label: "Last name", required: true, half: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "phone", label: "Phone", type: "tel" },
            { name: "message", label: "Notes", textarea: true },
          ]}
        />
      </Modal>
    </div>
  );
}
