import { describe, expect, it } from "vitest";
import {
  DEFAULT_POLICY_ID,
  STANDARD_POLICIES,
  findPolicy,
  isPolicyId,
  newPolicyId,
  paragraphs,
  readPolicies,
  resolvePolicy,
  sanitizePolicies,
  snapshotPolicy,
  type CancellationPolicy,
} from "@/lib/cancellation";

const holiday: CancellationPolicy = { id: "cp_holiday1", name: "Holiday season", summary: "Non-refundable for December move-ins.", details: "Para one.\n\nPara two." };

describe("standard policies (backward compatible)", () => {
  it("keeps the three ids existing listings use", () => {
    expect(STANDARD_POLICIES.map((p) => p.id)).toEqual(["flexible", "moderate", "strict"]);
    expect(resolvePolicy("strict").name).toBe("Strict");
  });
  it("defaults to Moderate", () => {
    expect(DEFAULT_POLICY_ID).toBe("moderate");
  });
});

describe("resolvePolicy", () => {
  it("finds special policies", () => {
    expect(resolvePolicy("cp_holiday1", [holiday])).toEqual(holiday);
  });
  it("falls back to the default when a policy was removed or is unknown", () => {
    expect(resolvePolicy("cp_gone12", [holiday]).id).toBe("moderate");
    expect(resolvePolicy(undefined).id).toBe("moderate");
    expect(findPolicy("cp_gone12", [holiday])).toBeUndefined();
  });
});

describe("snapshotPolicy", () => {
  it("copies the wording and marks standard vs special", () => {
    expect(snapshotPolicy("flexible")).toMatchObject({ id: "flexible", name: "Flexible", standard: true });
    expect(snapshotPolicy("cp_holiday1", [holiday])).toEqual({ ...holiday, standard: false });
  });
  it("is a copy: editing the policy later doesn't change it", () => {
    const list = [{ ...holiday }];
    const snap = snapshotPolicy("cp_holiday1", list);
    list[0].summary = "Changed";
    expect(snap.summary).toBe(holiday.summary);
  });
});

describe("sanitizePolicies", () => {
  it("accepts and trims valid input, dropping empty details", () => {
    const res = sanitizePolicies([{ id: "cp_abcd1", name: " A ", summary: " s ", details: "  " }]);
    expect(res).toEqual({ ok: true, policies: [{ id: "cp_abcd1", name: "A", summary: "s" }] });
  });
  it("treats missing as none", () => {
    expect(sanitizePolicies(undefined)).toEqual({ ok: true, policies: [] });
  });
  it.each([
    ["not a list", "x"],
    ["standard id", [{ id: "moderate", name: "X", summary: "s" }]],
    ["bad id", [{ id: "cp_A!", name: "X", summary: "s" }]],
    ["no name", [{ id: "cp_abcd1", name: "", summary: "s" }]],
    ["no summary", [{ id: "cp_abcd1", name: "X", summary: " " }]],
    ["non-text field", [{ id: "cp_abcd1", name: 5, summary: "s" }]],
    ["name too long", [{ id: "cp_abcd1", name: "x".repeat(61), summary: "s" }]],
    ["details too long", [{ id: "cp_abcd1", name: "X", summary: "s", details: "x".repeat(4001) }]],
    ["clashes with standard name", [{ id: "cp_abcd1", name: "strict", summary: "s" }]],
    ["duplicate names", [{ id: "cp_abcd1", name: "Same", summary: "s" }, { id: "cp_abcd2", name: "same", summary: "t" }]],
    ["duplicate ids", [{ id: "cp_abcd1", name: "A", summary: "s" }, { id: "cp_abcd1", name: "B", summary: "t" }]],
  ])("rejects %s", (_, v) => {
    expect(sanitizePolicies(v).ok).toBe(false);
  });
  it("caps the number of policies", () => {
    const many = Array.from({ length: 51 }, (_, i) => ({ id: `cp_p${String(i).padStart(4, "0")}`, name: `P${i}`, summary: "s" }));
    expect(sanitizePolicies(many).ok).toBe(false);
  });
});

describe("readPolicies (public pages)", () => {
  it("keeps the valid ones and drops malformed entries instead of failing", () => {
    expect(readPolicies([holiday, { id: "bad" }, null])).toEqual([holiday]);
    expect(readPolicies("garbage")).toEqual([]);
  });
});

describe("helpers", () => {
  it("isPolicyId accepts standard and special shapes only", () => {
    expect(isPolicyId("moderate")).toBe(true);
    expect(isPolicyId(newPolicyId())).toBe(true);
    expect(isPolicyId("Moderate")).toBe(false);
    expect(isPolicyId("<script>")).toBe(false);
    expect(isPolicyId(42)).toBe(false);
  });
  it("splits paragraphs on blank lines", () => {
    expect(paragraphs("a\n\n b \n\n\nc\nd")).toEqual(["a", "b", "c\nd"]);
    expect(paragraphs(undefined)).toEqual([]);
  });
});
