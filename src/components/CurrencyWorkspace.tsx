"use client";

import { useEffect, useState } from "react";
import Calculator from "@/components/Calculator";
import SettlementsTable from "@/components/SettlementsTable";
import { useLanguage } from "@/lib/i18n";
import type { CurrencyTable } from "@/types";

export default function CurrencyWorkspace({ currencyTable }: { currencyTable: CurrencyTable | null }) {
  const { t } = useLanguage();
  const [view, setView] = useState<"calculator" | "settlements">("calculator");

  useEffect(() => {
    const openCalculator = () => setView("calculator");
    window.addEventListener("open-calculator", openCalculator);
    return () => window.removeEventListener("open-calculator", openCalculator);
  }, []);

  return (
    <div className="w-full max-w-3xl">
      <header className="mb-6 text-center sm:mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t("pageTitle")}</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">{t("pageDescription")}</p>
      </header>
      <div id="discover" className="scroll-mt-4">
        {!currencyTable ? (
          <section aria-labelledby="rates-unavailable" className="rounded-xl border border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900 sm:p-6">
            <h2 id="rates-unavailable" className="text-lg font-semibold">{t("unavailableTitle")}</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">{t("unavailableDescription")}</p>
          </section>
        ) : (
          <>
            <nav className="mb-6 flex justify-center" aria-label={t("viewLabel")}>
              <div className="inline-flex rounded-full border border-slate-300 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <button type="button" onClick={() => setView("calculator")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${view === "calculator" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"}`}>{t("calculator")}</button>
                <button type="button" onClick={() => setView("settlements")} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${view === "settlements" ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950" : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"}`}>{t("settlements")}</button>
              </div>
            </nav>
            {view === "calculator" ? <Calculator currencyTable={currencyTable} /> : <SettlementsTable currencyTable={currencyTable} />}
          </>
        )}
      </div>
    </div>
  );
}
