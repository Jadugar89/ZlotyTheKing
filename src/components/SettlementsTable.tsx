"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { convertToPln, getStoredCurrency, prioritizeRates, sanitizeAmountInput, storeCurrency } from "@/lib/currency";
import { useLanguage } from "@/lib/i18n";
import { useUnsavedChangesWarning } from "@/lib/useUnsavedChangesWarning";
import type { CurrencyTable, Rate, SettlementRecord } from "@/types";

const STORAGE_KEY = "zloty-the-king:settlements";
const fieldClassName = "mt-2 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus-visible:outline-blue-400";

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadSettlements(): SettlementRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed as SettlementRecord[] : [];
  } catch { return []; }
}

function escapeCsvValue(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];
    if (character === '"' && quoted && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.length > 0)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  row.push(value);
  if (row.some((cell) => cell.length > 0)) rows.push(row);
  return rows;
}

export default function SettlementsTable({ currencyTable }: { currencyTable: CurrencyTable }) {
  const { locale, t } = useLanguage();
  const rates = useMemo(() => prioritizeRates(currencyTable.rates), [currencyTable.rates]);
  const [records, setRecords] = useState<SettlementRecord[]>(loadSettlements);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currencyCode, setCurrencyCode] = useState("USD");
  const [currencyReady, setCurrencyReady] = useState(false);
  const [expenseDate, setExpenseDate] = useState(today);
  const [error, setError] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const todayDate = today();
  useUnsavedChangesWarning(name.trim() !== "" || amount.trim() !== "");
  const dateFormat = new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", { dateStyle: "medium", timeZone: "UTC" });
  const amountFormat = new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", { style: "currency", currency: "PLN", currencyDisplay: "code" });
  const rateFormat = new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", { maximumFractionDigits: 8 });

  useEffect(() => {
    const storedCurrency = getStoredCurrency(rates, rates[0]?.code ?? "USD");
    startTransition(() => {
      setCurrencyCode(storedCurrency);
      setCurrencyReady(true);
    });
  }, [rates]);

  useEffect(() => {
    if (currencyReady) storeCurrency(currencyCode);
  }, [currencyCode, currencyReady]);

  function persist(nextRecords: SettlementRecord[]) {
    setRecords(nextRecords);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  }

  function clearSettlements() {
    if (window.confirm(t("clearConfirm"))) persist([]);
  }

  function exportCsv() {
    const headers = ["name", "expenseDate", "amount", "currencyCode", "rate", "rateDate", "tableNo", "result"];
    const rows = records.map((record) => [record.name, record.expenseDate, record.amount.replace(",", "."), record.currencyCode, record.rate, record.rateDate, record.tableNo, record.result.toFixed(2)]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zloty-the-king-${today()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setImportMessage("");
    try {
      const rows = parseCsv(await file.text());
      const expectedHeaders = ["name", "expenseDate", "amount", "currencyCode", "rate", "rateDate", "tableNo", "result"];
      if (rows.length === 0 || rows[0].length !== expectedHeaders.length || rows[0].some((header, index) => header.replace(/^\uFEFF/, "") !== expectedHeaders[index])) throw new Error(t("importError"));
      const importedRecords = rows.slice(1).map((row): SettlementRecord | null => {
        if (row.length !== 8) return null;
        const [recordName, recordExpenseDate, recordAmount, recordCurrency, recordRate, recordRateDate, recordTable, recordResult] = row;
        const normalizedAmount = recordAmount.replace(",", ".");
        const amount = convertToPln(normalizedAmount, 1);
        const rate = Number(recordRate.replace(",", "."));
        const result = Number(recordResult.replace(",", "."));
        const validDate = /^\d{4}-\d{2}-\d{2}$/.test(recordExpenseDate) && /^\d{4}-\d{2}-\d{2}$/.test(recordRateDate);
        if (!recordName.trim() || amount === null || !Number.isFinite(rate) || rate <= 0 || !Number.isFinite(result) || !validDate || !/^[A-Z]{3}$/.test(recordCurrency) || !recordTable.trim()) return null;
        return { id: crypto.randomUUID(), name: recordName.trim(), amount: normalizedAmount, currencyCode: recordCurrency, expenseDate: recordExpenseDate, rateDate: recordRateDate, tableNo: recordTable, rate, result: amount * rate };
      });
      const validRecords = importedRecords.filter((record): record is SettlementRecord => record !== null);
      if (validRecords.length === 0 || validRecords.length !== importedRecords.length) throw new Error(t("importError"));
      persist([...validRecords, ...records]);
      setImportMessage(t("importSuccess").replace("{count}", String(validRecords.length)));
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : t("importError"));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const selectedRate = rates.find((rate) => rate.code === currencyCode);
    if (expenseDate > todayDate) {
      setError(t("futureDate"));
      return;
    }
    if (!name.trim() || !selectedRate || convertToPln(amount, 1) === null || !expenseDate) {
      setError(t("fillError"));
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/rates?date=${expenseDate}`);
      const table: CurrencyTable | { error?: string } = await response.json();
      if (!response.ok || !("rates" in table)) throw new Error(t("fetchError"));
      const historicalRate = table.rates.find((rate: Rate) => rate.code === currencyCode);
      const result = historicalRate ? convertToPln(amount, historicalRate.mid) : null;
      if (!historicalRate || result === null) throw new Error(t("missingRate"));
      const record: SettlementRecord = { id: crypto.randomUUID(), name: name.trim(), amount, currencyCode, expenseDate, rateDate: table.effectiveDate, tableNo: table.no, rate: historicalRate.mid, result };
      persist([record, ...records]);
      setName("");
      setAmount("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t("fetchError"));
    } finally { setIsSaving(false); }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-6">
        <h2 className="text-xl font-semibold">{t("newSettlement")}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("nextRateHelp")}</p>
        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div><label htmlFor="settlement-name" className="block text-sm font-medium">{t("subject")}</label><input id="settlement-name" className={fieldClassName} value={name} onChange={(event) => setName(event.target.value)} placeholder={t("namePlaceholder")} /></div>
          <div><label htmlFor="settlement-date" className="block text-sm font-medium">{t("expenseDate")}</label><input id="settlement-date" className={fieldClassName} type="date" max={todayDate} value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} /></div>
          <div><label htmlFor="settlement-amount" className="block text-sm font-medium">{t("amount")}</label><input id="settlement-amount" className={fieldClassName} inputMode="decimal" value={amount} onChange={(event) => setAmount(sanitizeAmountInput(event.target.value))} placeholder={t("amountPlaceholder")} /></div>
          <div><label htmlFor="settlement-currency" className="block text-sm font-medium">{t("currency")}</label><select id="settlement-currency" className={fieldClassName} value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value)}>{rates.map(({ code, currency }) => <option key={code} value={code}>{code} · {currency}</option>)}</select></div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><button type="submit" disabled={isSaving} className="min-h-11 rounded-md bg-blue-700 px-5 py-2 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">{isSaving ? t("saving") : t("save")}</button>{error && <p className="text-sm text-red-700 dark:text-red-300" role="alert">{error}</p>}</div>
        </form>
      </section>
      <section className="rounded-xl border border-slate-300 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6"><div><h2 className="text-xl font-semibold">{t("savedSettlements")}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t("localStorageHelp")}</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={records.length === 0} onClick={exportCsv} className="min-h-10 rounded-md border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-blue-300 dark:text-blue-200 dark:hover:bg-blue-950">{t("exportCsv")}</button><button type="button" onClick={() => fileInputRef.current?.click()} className="min-h-10 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500">{t("importCsv")}</button><input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} /></div></div>
        {importMessage && <p className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" role="status">{importMessage}</p>}
        {records.length === 0 ? <p className="px-5 py-8 text-center text-slate-600 dark:text-slate-300">{t("emptySettlements")}</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"><tr><th className="px-5 py-3">{t("subject")}</th><th className="px-5 py-3">{t("expense")}</th><th className="px-5 py-3">{t("rate")}</th><th className="px-5 py-3">{t("result")}</th><th className="px-5 py-3"><span className="sr-only">{t("actions")}</span></th></tr></thead><tbody className="divide-y divide-slate-200 dark:divide-slate-700">{records.map((record) => <tr key={record.id}><td className="whitespace-nowrap px-5 py-4 font-medium">{record.name}</td><td className="whitespace-nowrap px-5 py-4">{record.amount} {record.currencyCode}<span className="block text-xs text-slate-500">{dateFormat.format(new Date(`${record.expenseDate}T00:00:00Z`))}</span></td><td className="whitespace-nowrap px-5 py-4">{rateFormat.format(record.rate)}<span className="block text-xs text-slate-500">{record.tableNo} · {dateFormat.format(new Date(`${record.rateDate}T00:00:00Z`))}</span></td><td className="whitespace-nowrap px-5 py-4 font-semibold text-blue-800 dark:text-blue-200">{amountFormat.format(record.result)}</td><td className="px-5 py-4 text-right"><button type="button" className="text-sm font-medium text-red-700 hover:underline dark:text-red-300" onClick={() => persist(records.filter((item) => item.id !== record.id))}>{t("remove")}</button></td></tr>)}</tbody></table></div>}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700 sm:px-6"><p className="font-semibold">{t("totalPln")}: <span className="text-blue-800 dark:text-blue-200">{amountFormat.format(records.reduce((total, record) => total + record.result, 0))}</span></p><button type="button" disabled={records.length === 0} onClick={clearSettlements} className="min-h-10 rounded-md border border-red-700 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-300 dark:text-red-200 dark:hover:bg-red-950">{t("clear")}</button></div>
      </section>
    </div>
  );
}
