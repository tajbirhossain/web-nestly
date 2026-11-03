"use client";

import Modal from "@/components/ui/Modal";
import { AmenityIcon } from "@/components/ui/icons";
import PriceRange from "@/components/ui/PriceRange";
import { useSearchMeta } from "@/components/BookingRules";
import { featureFilters } from "@/lib/data";

export type FilterState = {
  beds: string;
  baths: string;
  price: [number, number];
  features: string[];
};

/** Filters with nothing applied; the price range spans the current listings. */
export const emptyFilters = (price: [number, number]): FilterState => ({ beds: "", baths: "", price, features: [] });

const chip = (active: boolean) =>
  `inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm transition ${
    active ? "border-brand bg-brand-tint font-medium text-brand" : "border-line hover:border-ink"
  }`;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-5 first:pt-0 last:border-0">
      <h3 className="mb-3 font-serif text-lg">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

export default function FiltersModal({
  open,
  onClose,
  value,
  onChange,
  count,
}: {
  open: boolean;
  onClose: () => void;
  value: FilterState;
  onChange: (v: FilterState) => void;
  count: number;
}) {
  const { price: priceMeta } = useSearchMeta();
  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) => onChange({ ...value, [k]: v });
  const single = (k: "beds" | "baths", opts: [string, string][]) =>
    opts.map(([v, label]) => (
      <button key={v} type="button" aria-pressed={value[k] === v} onClick={() => set(k, v)} className={chip(value[k] === v)}>
        {label}
      </button>
    ));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filters"
      footer={
        <>
          <button type="button" onClick={() => onChange(emptyFilters([priceMeta.min, priceMeta.max]))} className="text-sm font-medium underline underline-offset-4 hover:text-brand">
            Clear all
          </button>
          <button type="button" onClick={onClose} className="btn btn-primary !min-h-11">
            Show {count} {count === 1 ? "apartment" : "apartments"}
          </button>
        </>
      }
    >
      <section className="border-b border-line pb-6">
        <h3 className="font-serif text-lg">Price range</h3>
        <p className="mb-2 mt-1 text-sm text-muted">Monthly rent. Longer stays are priced per month.</p>
        <PriceRange min={priceMeta.min} max={priceMeta.max} step={priceMeta.step} prices={priceMeta.prices} value={value.price} onChange={(v) => set("price", v)} />
      </section>
      <Group title="Bedrooms">
        {single("beds", [["", "Any"], ["0", "Studio"], ["1", "1"], ["2", "2"], ["3", "3+"]])}
      </Group>
      <Group title="Bathrooms">{single("baths", [["", "Any"], ["1", "1"], ["2", "2"], ["3", "3+"]])}</Group>
      <Group title="Apartment features">
        {featureFilters.map((f) => {
          const on = value.features.includes(f);
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => set("features", on ? value.features.filter((x) => x !== f) : [...value.features, f])}
              className={chip(on)}
            >
              <AmenityIcon name={f} size={18} />
              {f}
            </button>
          );
        })}
      </Group>
    </Modal>
  );
}
