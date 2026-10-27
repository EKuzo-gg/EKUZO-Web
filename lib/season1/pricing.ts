import { OFFER } from "./offer";

export type QuoteKid = { firstName: string; age: number };
export type QuoteLine = { kidIndex: number; role: "first" | "sibling"; unitCents: number };
export type Quote = { lines: QuoteLine[]; totalCents: number };

/**
 * Server-side price. The first kid of a family is $100 unless the family
 * already has paid kids (priorPaidKids > 0), in which case every kid is $80.
 * The client never sends an amount. Throws on 0 kids, more than
 * OFFER.maxKidsPerOrder kids, or a bad priorPaidKids.
 */
export function quote(input: { kids: QuoteKid[]; priorPaidKids: number }): Quote {
  const { kids, priorPaidKids } = input;
  if (!Array.isArray(kids) || kids.length < 1) throw new Error("quote: at least 1 kid required");
  if (kids.length > OFFER.maxKidsPerOrder) {
    throw new Error(`quote: at most ${OFFER.maxKidsPerOrder} kids per order`);
  }
  if (!Number.isInteger(priorPaidKids) || priorPaidKids < 0) {
    throw new Error("quote: priorPaidKids must be a non-negative integer");
  }
  const lines: QuoteLine[] = kids.map((_, kidIndex) => {
    const first = kidIndex === 0 && priorPaidKids === 0;
    return {
      kidIndex,
      role: first ? "first" : "sibling",
      unitCents: first ? OFFER.firstKidCents : OFFER.siblingCents,
    };
  });
  const totalCents = lines.reduce((sum, l) => sum + l.unitCents, 0);
  return { lines, totalCents };
}
