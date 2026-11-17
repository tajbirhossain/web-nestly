// Cancellation policies. Every listing points at one policy by id.
//
// - Standard policies are built in and can't be edited (existing listings use these ids).
// - Special policies are written by the admin in Settings and stored with the site
//   settings (settings.cancellationPolicies), so they need no extra database table.
//
// Pure module with no imports: shared by the admin, the public pages and the APIs.

export type CancellationPolicy = {
  id: string;
  name: string;
  /** One or two sentences, shown in the booking card and the rules. */
  summary: string;
  /** Optional full terms, shown on the listing page. Paragraphs separated by a blank line. */
  details?: string;
};

/** A policy as stored on a booking: the exact wording the guest saw when they requested it. */
export type PolicySnapshot = CancellationPolicy & { standard: boolean };

export const STANDARD_POLICIES: CancellationPolicy[] = [
  { id: "flexible", name: "Flexible", summary: "Free cancellation up to 14 days before move-in. After that, the first month's rent is non-refundable." },
  { id: "moderate", name: "Moderate", summary: "Free cancellation up to 30 days before move-in. After that, the first month's rent is non-refundable." },
  { id: "strict", name: "Strict", summary: "Free cancellation within 48 hours of confirming if move-in is 60+ days away. After that, the first month's rent is non-refundable." },
];

/** Used for new listings, and as a safe fallback if a listing points at a policy that no longer exists. */
export const DEFAULT_POLICY_ID = "moderate";

export const LIMITS = { name: 60, summary: 300, details: 4000, count: 50 } as const;
export const CUSTOM_ID = /^cp_[a-z0-9]{4,20}$/;

const standardIds = new Set(STANDARD_POLICIES.map((p) => p.id));
export const isStandardPolicy = (id: string) => standardIds.has(id);

/** Standard policies first, then the admin's special ones. */
export const allPolicies = (custom: CancellationPolicy[] = []) => [...STANDARD_POLICIES, ...custom];

export function findPolicy(id: string | undefined, custom: CancellationPolicy[] = []): CancellationPolicy | undefined {
  return id ? allPolicies(custom).find((p) => p.id === id) : undefined;
}

/** The policy a listing uses; falls back to the default when its policy was removed. */
export function resolvePolicy(id: string | undefined, custom: CancellationPolicy[] = []): CancellationPolicy {
  return findPolicy(id, custom) ?? findPolicy(DEFAULT_POLICY_ID)!;
}

export function snapshotPolicy(id: string | undefined, custom: CancellationPolicy[] = []): PolicySnapshot {
  const p = resolvePolicy(id, custom);
  return { id: p.id, name: p.name, summary: p.summary, ...(p.details ? { details: p.details } : {}), standard: isStandardPolicy(p.id) };
}

/** A listing may only reference a standard id or a special-policy id shape. */
export const isPolicyId = (v: unknown): v is string => typeof v === "string" && (standardIds.has(v) || CUSTOM_ID.test(v));

export const paragraphs = (text = "") => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\r\n/g, "\n").trim() : null);

/** Problem with one special policy, or null if it's valid. Names must be unique, including against standard names. */
export function policyProblem(p: CancellationPolicy, others: CancellationPolicy[]): string | null {
  if (!p.name) return "Give the policy a name";
  if (p.name.length > LIMITS.name) return `Keep the name under ${LIMITS.name} characters`;
  if (!p.summary) return "Add a short summary";
  if (p.summary.length > LIMITS.summary) return `Keep the summary under ${LIMITS.summary} characters`;
  if ((p.details ?? "").length > LIMITS.details) return `Keep the full terms under ${LIMITS.details} characters`;
  const taken = allPolicies(others).some((o) => o.id !== p.id && o.name.trim().toLowerCase() === p.name.toLowerCase());
  if (taken) return `There's already a policy called "${p.name}"`;
  return null;
}

/**
 * Validates special policies from an admin save. Returns the cleaned list, or an error
 * message. Missing input means "none".
 */
export function sanitizePolicies(v: unknown): { ok: true; policies: CancellationPolicy[] } | { ok: false; error: string } {
  if (v === undefined || v === null) return { ok: true, policies: [] };
  if (!Array.isArray(v)) return { ok: false, error: "Cancellation policies must be a list" };
  if (v.length > LIMITS.count) return { ok: false, error: `Up to ${LIMITS.count} special policies` };
  const out: CancellationPolicy[] = [];
  for (const raw of v) {
    if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid cancellation policy" };
    const r = raw as Record<string, unknown>;
    const id = clean(r.id);
    if (!id || !CUSTOM_ID.test(id)) return { ok: false, error: "Invalid cancellation policy id" };
    if (out.some((p) => p.id === id)) return { ok: false, error: "Duplicate cancellation policy id" };
    const name = clean(r.name);
    const summary = clean(r.summary);
    const details = r.details === undefined ? "" : clean(r.details);
    if (name === null || summary === null || details === null) return { ok: false, error: "Policy fields must be text" };
    const p: CancellationPolicy = { id, name, summary, ...(details ? { details } : {}) };
    const problem = policyProblem(p, out);
    if (problem) return { ok: false, error: problem };
    out.push(p);
  }
  return { ok: true, policies: out };
}

/** Lenient read for public pages: keeps valid special policies and drops anything malformed. */
export function readPolicies(v: unknown): CancellationPolicy[] {
  if (!Array.isArray(v)) return [];
  const res = sanitizePolicies(v);
  if (res.ok) return res.policies;
  return v.flatMap((one) => {
    const r = sanitizePolicies([one]);
    return r.ok ? r.policies : [];
  });
}

export const newPolicyId = () => `cp_${Math.random().toString(36).slice(2, 10).padEnd(6, "0")}`;
