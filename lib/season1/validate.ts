import { OFFER } from "./offer";

export const SRC_VALUES = ["karlin", "email", "friend", "ad", "direct"] as const;
export type Src = (typeof SRC_VALUES)[number];

export type ValidKid = { firstName: string; firstNameKey: string; age: number; ageEdge: boolean };
export type CommitInput = {
  email: string;
  parentFirstName: string;
  phone: string | null;
  kids: ValidKid[];
  consent: true;
  src: Src | null;
};
export type ValidateResult =
  | { ok: true; value: CommitInput }
  | { ok: false; field: string; error: string };

/** Lowercase, NFD, strip diacritics. Used for the folded first-name key. */
export function foldName(name: string): string {
  return name.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** True at the youngest and oldest accepted ages (9 and 18). */
export function ageEdge(age: number): boolean {
  return age === OFFER.ageMin || age === OFFER.ageMax;
}

/** AUD-A (P4): flags known at commit. Any kid at the youngest or oldest accepted age flags the order. */
export function commitFlags(kids: { ageEdge: boolean }[]): string[] {
  return kids.some((k) => k.ageEdge) ? ["age_edge"] : [];
}

const fail = (field: string, error: string): ValidateResult => ({ ok: false, field, error });

function cleanName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.normalize("NFC").trim().replace(/\s+/g, " ");
  const len = [...s].length;
  if (len < 1 || len > 20) return null;
  // Must start with a letter; then letters, marks, spaces, hyphens, apostrophes.
  if (!/^\p{L}[\p{L}\p{M} '’-]*$/u.test(s)) return null;
  return s;
}

function cleanEmail(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  if (s.length < 3 || s.length > 254) return null;
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(s)) return null;
  if (s.split("@")[0].length > 64 || s.includes("..")) return null;
  return s;
}

export function validateCommit(body: unknown): ValidateResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("body", "invalid");
  const b = body as Record<string, unknown>;

  // Honeypot: must be absent or an empty string.
  if (b.company !== undefined && b.company !== null && b.company !== "") {
    return fail("company", "invalid");
  }

  const email = cleanEmail(b.email);
  if (!email) return fail("email", "invalid");

  const parentFirstName = cleanName(b.parentFirstName);
  if (!parentFirstName) return fail("parentFirstName", "invalid");

  let phone: string | null = null;
  if (b.phone !== undefined && b.phone !== null && b.phone !== "") {
    if (typeof b.phone !== "string") return fail("phone", "invalid");
    const p = b.phone.trim();
    if (p) {
      const digits = p.replace(/\D/g, "").length;
      if (p.length > 20 || !/^[0-9+()\- ]+$/.test(p) || digits < 7) return fail("phone", "invalid");
      phone = p;
    }
  }

  if (!Array.isArray(b.kids) || b.kids.length < 1) return fail("kids", "kids_required");
  if (b.kids.length > OFFER.maxKidsPerOrder) return fail("kids", "too_many_kids");

  const kids: ValidKid[] = [];
  for (let i = 0; i < b.kids.length; i++) {
    const k = b.kids[i];
    if (!k || typeof k !== "object") return fail(`kids.${i}`, "invalid");
    const kr = k as Record<string, unknown>;
    const firstName = cleanName(kr.firstName);
    if (!firstName) return fail(`kids.${i}.firstName`, "invalid");

    let age: number;
    if (kr.age === "outside") return fail(`kids.${i}.age`, "age_outside");
    if (typeof kr.age === "number") age = kr.age;
    else if (typeof kr.age === "string" && /^\d{1,3}$/.test(kr.age.trim())) age = Number(kr.age.trim());
    else return fail(`kids.${i}.age`, "invalid");
    if (!Number.isInteger(age)) return fail(`kids.${i}.age`, "invalid");
    if (age < OFFER.ageMin || age > OFFER.ageMax) return fail(`kids.${i}.age`, "age_outside");

    kids.push({ firstName, firstNameKey: foldName(firstName), age, ageEdge: ageEdge(age) });
  }

  if (b.consent !== true) return fail("consent", "required");

  let src: Src | null = null;
  if (b.src !== undefined && b.src !== null && b.src !== "") {
    if (typeof b.src !== "string" || !(SRC_VALUES as readonly string[]).includes(b.src)) {
      return fail("src", "invalid");
    }
    src = b.src as Src;
  }

  return { ok: true, value: { email, parentFirstName, phone, kids, consent: true, src } };
}
