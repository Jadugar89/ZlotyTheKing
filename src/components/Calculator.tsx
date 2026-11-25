"use client";

import { startTransition, useEffect, useId, useMemo, useState } from "react";
import { convertToPln, getStoredCurrency, prioritizeRates, sanitizeAmountInput, storeCurrency } from "@/lib/currency";
import { useLanguage } from "@/lib/i18n";
import type { CurrencyTable } from "@/types";

const fieldClassName = "mt-2 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus-visible:outline-blue-400";

export default function Calculator({ currencyTable }: { currencyTable: CurrencyTable }) {
  const { locale, t } = useLanguage();
  const id = useId();
  const rates = useMemo(() => prioritizeRates(currencyTable.rates), [currencyTable.rates]);
  const [amount, setAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [currencyReady, setCurrencyReady] = useState(false);
  const { no, effectiveDate } = currencyTable;
  const rate = rates.find((item) => item.code === currencyCode) ?? rates[0];
  const result = convertToPln(amount, rate.mid);
  const invalidAmount = amount.trim() !== "" && result === null;
  const amountFormat = new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", { style: "currency", currency: "PLN", currencyDisplay: "code" });
  const rateFormat = new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", { maximumFractionDigits: 8 });
  const dateFormat = new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", { dateStyle: "long", timeZone: "UTC" });

  useEffect(() => {
    const storedCurrency = getStoredCurrency(rates);
    startTransition(() => {
      setCurrencyCode(storedCurrency);
      setCurrencyReady(true);
    });
  }, [rates]);

  useEffect(() => {
    if (currencyReady) storeCurrency(currencyCode);
  }, [currencyCode, currencyReady]);

  return (
    <section aria-labelledby={`${id}-title`} className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
      <h2 id={`${id}-title`} className="text-xl font-semibold">{t("convertTitle")}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("nbpTable")} {no} · <time dateTime={effectiveDate}>{dateFormat.format(new Date(effectiveDate))}</time></p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="min-w-0">
          <label htmlFor={`${id}-amount`} className="block text-sm font-medium">{t("amount")}</label>
          <input id={`${id}-amount`} className={fieldClassName} inputMode="decimal" type="text" value={amount} onChange={(event) => setAmount(sanitizeAmountInput(event.target.value))} aria-invalid={invalidAmount} />
          {invalidAmount && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{t("invalidAmount")}</p>}
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-currency`} className="block text-sm font-medium">{t("currency")}</label>
          <select id={`${id}-currency`} className={fieldClassName} value={rate.code} onChange={(event) => setCurrencyCode(event.target.value)}>{rates.map(({ code, currency }) => <option key={code} value={code}>{code} · {currency}</option>)}</select>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-result`} className="block text-sm font-medium">{t("result")}</label>
          <output id={`${id}-result`} className="mt-2 block min-h-11 break-words rounded-md bg-blue-50 px-3 py-2 font-semibold tabular-nums text-blue-900 dark:bg-blue-950 dark:text-blue-100">{result === null ? "—" : amountFormat.format(result)}</output>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{t("rateEquals").replace("{currency}", rate.code).replace("{rate}", rateFormat.format(rate.mid))}</p>
    </section>
  );
}
