import { describe, expect, it } from "vitest";
import { allAmenities, amenityIconKey, featureFilters, groupAmenities, sortAmenities } from "@/lib/amenities";

// The original 10 names are stored on existing listings and used by search filters: they must never change.
const ORIGINAL = [
  "Wi‑Fi", "Air conditioning", "Fully equipped kitchen", "Washer/dryer in unit", "Dishwasher",
  "Dedicated workspace", "Pets allowed", "Doorman", "Gym", "Towels & linens provided",
];

describe("amenity catalog", () => {
  it("keeps every original amenity name exactly, and still filterable", () => {
    for (const name of ORIGINAL) expect(featureFilters).toContain(name);
  });

  it("adds the researched filters", () => {
    expect(featureFilters).toEqual(expect.arrayContaining(["Elevator", "Laundry in building", "Parking"]));
  });

  it("has unique names (case-insensitive)", () => {
    const names = allAmenities.map((a) => a.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every catalog amenity its own icon, never the generic check", () => {
    for (const a of allAmenities) expect(amenityIconKey(a.name), a.name).toBe(a.icon);
    expect(allAmenities.every((a) => a.icon !== "check")).toBe(true);
  });

  it("maps older and custom names to sensible icons", () => {
    expect(amenityIconKey("Wide screen TV")).toBe("tv");
    expect(amenityIconKey("Live TV")).toBe("tv");
    expect(amenityIconKey("Garage parking")).toBe("parking");
    expect(amenityIconKey("Rooftop terrace")).toBe("balcony");
    expect(amenityIconKey("Keyless entry")).toBe("key");
    expect(amenityIconKey("Fireplace")).toBe("check");
    // "Concierge" must not be caught by the TV rule, and in-unit vs building laundry differ.
    expect(amenityIconKey("Concierge")).toBe("doorman");
    expect(amenityIconKey("Washer in unit")).toBe("washer");
  });

  it("groups by category in catalog order with unknown names under Other", () => {
    const groups = groupAmenities(["Parking", "Fireplace", "Wi‑Fi", "Elevator", "Smoke alarm"]);
    expect(groups.map((g) => g.title)).toEqual(["Essentials", "Building", "Arrival & parking", "Safety", "Other"]);
    expect(groups.at(-1)!.items).toEqual(["Fireplace"]);
  });

  it("sorts important amenities first without dropping any", () => {
    const input = ["Fireplace", "First-aid kit", "Wi‑Fi", "Elevator"];
    const out = sortAmenities(input);
    expect(out[0]).toBe("Wi‑Fi");
    expect([...out].sort()).toEqual([...input].sort());
  });
});
