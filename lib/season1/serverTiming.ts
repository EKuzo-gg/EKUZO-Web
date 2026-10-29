import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Server-Timing for the commit API (canary 10-29: "the saving took ~5 sec").
 * A request runs inside runTimed(); every Neon HTTP round trip (through the
 * fetch hook in db.ts) and every Stripe call wrapped in timed("stripe", ...)
 * adds to its phase. The header carries durations and counts only, never PII.
 * Outside runTimed() timed() is a plain pass-through.
 */

export type Phase = "db" | "stripe";

export class ServerTiming {
  private readonly t0 = performance.now();
  private readonly ms: Record<Phase, number> = { db: 0, stripe: 0 };
  private readonly n: Record<Phase, number> = { db: 0, stripe: 0 };
  /** The first DB round trip alone: a Neon scale-to-zero wake shows up here. */
  private dbFirst: number | null = null;
  private readonly cold: boolean;

  constructor(cold: boolean = false) {
    this.cold = cold;
  }

  add(phase: Phase, ms: number): void {
    this.ms[phase] += ms;
    this.n[phase] += 1;
    if (phase === "db" && this.dbFirst === null) this.dbFirst = ms;
  }

  header(): string {
    const f = (x: number) => x.toFixed(1);
    const parts = [
      `db;dur=${f(this.ms.db)};desc="${this.n.db} queries"`,
      `dbfirst;dur=${f(this.dbFirst ?? 0)}`,
      `stripe;dur=${f(this.ms.stripe)};desc="${this.n.stripe} calls"`,
      `app;dur=${f(performance.now() - this.t0)}`,
    ];
    if (this.cold) parts.push(`cold;desc="first request on this function instance"`);
    return parts.join(", ");
  }
}

const store = new AsyncLocalStorage<ServerTiming>();

/**
 * True for the first Season 01 API request this process (function instance)
 * serves, whichever route it hits (warm or commit): a process-wide flag on
 * globalThis, so a warm call marks the instance as no longer cold for commit.
 */
export function takeColdFlag(): boolean {
  const g = globalThis as { __s1InstanceServed?: boolean };
  const cold = !g.__s1InstanceServed;
  g.__s1InstanceServed = true;
  return cold;
}

export function runTimed<T>(st: ServerTiming, fn: () => T): T {
  return store.run(st, fn);
}

export async function timed<T>(phase: Phase, fn: () => Promise<T>): Promise<T> {
  const st = store.getStore();
  if (!st) return fn();
  const t0 = performance.now();
  try {
    return await fn();
  } finally {
    st.add(phase, performance.now() - t0);
  }
}
