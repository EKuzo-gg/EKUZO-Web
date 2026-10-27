import { randomInt } from "node:crypto";

// Standard Damm quasigroup (weakly totally anti-symmetric, 10x10).
const DAMM: readonly (readonly number[])[] = [
  [0, 3, 1, 7, 5, 9, 8, 6, 4, 2],
  [7, 0, 9, 2, 1, 5, 4, 8, 6, 3],
  [4, 2, 0, 6, 8, 7, 1, 3, 5, 9],
  [1, 7, 5, 0, 9, 8, 3, 4, 2, 6],
  [6, 1, 2, 3, 0, 4, 5, 9, 7, 8],
  [3, 6, 7, 4, 2, 0, 9, 5, 8, 1],
  [5, 8, 6, 9, 7, 2, 0, 1, 3, 4],
  [8, 9, 4, 5, 3, 6, 2, 0, 1, 7],
  [9, 4, 3, 8, 6, 1, 7, 2, 0, 5],
  [2, 5, 8, 1, 4, 3, 6, 7, 9, 0],
];

function dammInterim(digits: string): number {
  let interim = 0;
  for (const ch of digits) interim = DAMM[interim][ch.charCodeAt(0) - 48];
  return interim;
}

/** Check digit (0 to 9) for a string of digits. */
export function dammCheckDigit(digits: string): number {
  if (!/^\d*$/.test(digits)) throw new Error("dammCheckDigit: digits only");
  return dammInterim(digits);
}

/** True when the digit string (check digit included) validates. */
export function dammValid(digits: string): boolean {
  return /^\d+$/.test(digits) && dammInterim(digits) === 0;
}

function digit(min: number, max: number, rand?: () => number): number {
  // [min, max) integer
  if (rand) return Math.min(max - 1, min + Math.floor(rand() * (max - min)));
  return randomInt(min, max);
}

/**
 * Mint a family code: 7 random digits (first 1 to 9) plus the Damm check
 * digit, 8 chars. `rand` is a Math.random-style function returning [0,1);
 * default is crypto.randomInt.
 */
export function mintNumeric(rand?: () => number): string {
  let s = String(digit(1, 10, rand));
  for (let i = 0; i < 6; i++) s += String(digit(0, 10, rand));
  return s + String(dammCheckDigit(s));
}

/** 8 digits, first digit 1 to 9, Damm-valid. */
export function isValidNumeric(s: string): boolean {
  return typeof s === "string" && /^[1-9]\d{7}$/.test(s) && dammValid(s);
}

/**
 * Normalize user input. Strips whitespace and hyphens. All-digit input must
 * be a valid numeric code. Otherwise a vanity code `^[a-z]{3,20}$` after
 * lowercasing. Returns null when neither.
 */
export function normalize(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const s = input.replace(/[\s\-‐-―]/g, "");
  if (!s) return null;
  if (/^\d+$/.test(s)) return isValidNumeric(s) ? s : null;
  const v = s.toLowerCase();
  return /^[a-z]{3,20}$/.test(v) ? v : null;
}

/** "48271937" -> "4827 1937"; vanity codes unchanged. */
export function display(code: string): string {
  return /^\d{8}$/.test(code) ? `${code.slice(0, 4)} ${code.slice(4)}` : code;
}
