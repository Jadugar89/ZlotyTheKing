import type { CurrencyTable, Rate } from "@/types";

const TABLE_A_URL = "https://api.nbp.pl/api/exchangerates/tables/a?format=json";

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
}

function isRate(value: unknown): value is Rate {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof value.code === "string" &&
    /^[A-Z]{3}$/.test(value.code) &&
    "currency" in value &&
    typeof value.currency === "string" &&
    value.currency.trim() !== "" &&
    "mid" in value &&
    typeof value.mid === "number" &&
    Number.isFinite(value.mid) &&
    value.mid > 0
  );
}

function isPublicationDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().startsWith(value);
}

function isCurrencyTable(value: unknown): value is CurrencyTable {
  return (
    typeof value === "object" &&
    value !== null &&
    "table" in value &&
    value.table === "A" &&
    "no" in value &&
    typeof value.no === "string" &&
    value.no.trim() !== "" &&
    "effectiveDate" in value &&
    isPublicationDate(value.effectiveDate) &&
    "rates" in value &&
    Array.isArray(value.rates) &&
    value.rates.length > 0 &&
    value.rates.every(isRate) &&
    new Set(value.rates.map((rate) => rate.code)).size === value.rates.length
  );
}

export async function getCurrencyTable(): Promise<CurrencyTable | null> {
  try {
    const response = await fetch(TABLE_A_URL, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`NBP returned HTTP ${response.status}`);
    }

    const data: unknown = await response.json();
    const table: unknown = Array.isArray(data) ? data[0] : null;

    if (!isCurrencyTable(table)) {
      throw new Error("NBP returned an invalid exchange rate table");
    }

    return table;
  } catch (error) {
    console.error("Could not load NBP exchange rates", error);
    return null;
  }
}

export async function getCurrencyTableForSettlementDate(
  expenseDate: string,
): Promise<CurrencyTable | null> {
  if (!isValidDateString(expenseDate)) {
    return null;
  }

  if (expenseDate > new Date().toISOString().slice(0, 10)) {
    return null;
  }

  // NBP does not publish tables on weekends and some holidays. Query a range
  // and choose the first published table after the expense date, rather than
  // assuming that the calendar day after it has a rate.
  try {
    for (let offset = 1; offset <= 7; offset += 1) {
      const rateDate = addDays(expenseDate, offset);
      const url = `https://api.nbp.pl/api/exchangerates/tables/a/${rateDate}?format=json`;
      const response = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        continue;
      }

      const data: unknown = await response.json();
      const table = Array.isArray(data)
        ? data.find((item): item is CurrencyTable => isCurrencyTable(item))
        : null;

      if (table) {
        return table;
      }
    }

    throw new Error("NBP returned no valid exchange rate table for the selected date");
  } catch (error) {
    console.error("Could not load historical NBP exchange rates", error);
    return null;
  }
}
