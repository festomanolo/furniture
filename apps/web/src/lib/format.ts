import { formatTzs, type Locale } from "@samani/shared";

export const tzs = (amount: number, locale: Locale) => formatTzs(amount, locale);

const DAR_TZ = "Africa/Dar_es_Salaam";
export function formatDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "sw" ? "sw-TZ" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: DAR_TZ,
  }).format(new Date(iso));
}

export function range([a, b]: [number, number]) {
  return a === b ? `${a}` : `${a}-${b}`;
}
