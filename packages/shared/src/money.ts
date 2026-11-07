/**
 * Money is always an integer number of Tanzanian Shillings (TZS has no minor unit in practice).
 * Never use floating-point arithmetic for money; percentages are expressed in basis points.
 */
export type Tzs = number & { readonly __brand?: "TZS" };

export function assertTzs(value: number): Tzs {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`Invalid TZS amount: ${value}`);
  }
  return value as Tzs;
}

/** Applies a rate in basis points (1% = 100 bps) with banker-safe integer rounding (half up). */
export function applyBps(amount: Tzs, bps: number): Tzs {
  if (!Number.isInteger(bps) || bps < 0) throw new RangeError(`Invalid bps: ${bps}`);
  return assertTzs(Math.floor((amount * bps + 5000) / 10000));
}

export function sumTzs(values: readonly number[]): Tzs {
  return assertTzs(values.reduce((a, b) => a + b, 0));
}

export function formatTzs(amount: number, locale: "sw" | "en" = "sw"): string {
  const n = new Intl.NumberFormat(locale === "sw" ? "sw-TZ" : "en-TZ", { maximumFractionDigits: 0 }).format(amount);
  return `TSh ${n}`;
}

export function discountPercent(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
