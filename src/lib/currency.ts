import type { Rate } from "@/types";

const currencyPriority = ["USD", "EUR", "GBP", "CHF", "JPY", "CAD", "AUD", "NOK", "SEK", "DKK"];

const LAST_CURRENCY_KEY = "zloty-the-king:last-currency";

export function getStoredCurrency(rates: Rate[], fallback = "USD") {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(LAST_CURRENCY_KEY);
  return stored && rates.some((rate) => rate.code === stored) ? stored : fallback;
}

export function storeCurrency(code: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LAST_CURRENCY_KEY, code);
  }
}

export function sanitizeAmountInput(value: string) {
  const filtered = value.replace(/[^\d.,]/g, "");
  const separatorIndex = filtered.search(/[.,]/);

  if (separatorIndex === -1) return filtered;

  const integerPart = filtered.slice(0, separatorIndex);
  const separator = filtered[separatorIndex];
  const decimalPart = filtered.slice(separatorIndex + 1).replace(/[.,]/g, "").slice(0, 2);
  return `${integerPart}${separator}${decimalPart}`;
}

export function prioritizeRates(rates: Rate[]) {
  return [...rates].sort((left, right) => {
    const leftPriority = currencyPriority.indexOf(left.code);
    const rightPriority = currencyPriority.indexOf(right.code);
    const normalizedLeft = leftPriority === -1 ? Number.MAX_SAFE_INTEGER : leftPriority;
    const normalizedRight = rightPriority === -1 ? Number.MAX_SAFE_INTEGER : rightPriority;
    return normalizedLeft - normalizedRight;
  });
}

export function convertToPln(amount: string, rate: number): number | null {
  const input = amount.trim();

  if (!/^(?:\d+(?:[.,]\d{0,2})?|[.,]\d{1,2})$/.test(input)) {
    return null;
  }

  const total = Number(input.replace(",", ".")) * rate;
  return Number.isFinite(total) ? total : null;
}
