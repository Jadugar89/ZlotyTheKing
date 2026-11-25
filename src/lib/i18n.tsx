"use client";

import { createContext, startTransition, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Locale = "pl" | "en";

const messages = {
  pl: {
    brandTagline: "Kursy polskiej waluty",
    homeLabel: "Złoty the King — strona główna",
    convertLink: "Przelicz walutę",
    calculator: "Kalkulator",
    settlements: "Rozliczenia",
    viewLabel: "Widok aplikacji",
    pageTitle: "Kursy polskiego złotego",
    pageDescription: "Przelicz waluty na PLN według średnich kursów Narodowego Banku Polskiego.",
    unavailableTitle: "Kursy walut są chwilowo niedostępne",
    unavailableDescription: "Nie udało się pobrać najnowszej tabeli NBP. Spróbuj odświeżyć stronę za chwilę.",
    convertTitle: "Przelicz na PLN",
    nbpTable: "Tabela NBP",
    amount: "Kwota",
    currency: "Waluta",
    result: "Wynik",
    invalidAmount: "Wpisz nieujemną kwotę z maksymalnie dwoma miejscami po przecinku.",
    rateEquals: "1 {currency} = {rate} PLN",
    newSettlement: "Nowe rozliczenie",
    nextRateHelp: "Kurs zostanie pobrany z pierwszej dostępnej tabeli NBP po dniu wydatku — także po weekendzie.",
    subject: "Czego dotyczy",
    expenseDate: "Dzień wydatku",
    namePlaceholder: "np. Delegacja Berlin",
    amountPlaceholder: "0,00",
    save: "Zapisz rozliczenie",
    saving: "Pobieranie kursu…",
    fillError: "Uzupełnij nazwę, poprawną kwotę, walutę i datę wydatku.",
    futureDate: "Nie można wybrać daty z przyszłości.",
    fetchError: "Nie udało się pobrać kursu NBP dla wybranego dnia.",
    missingRate: "Brak kursu dla wybranej waluty.",
    savedSettlements: "Zapisane rozliczenia",
    localStorageHelp: "Dane są przechowywane lokalnie w tej przeglądarce.",
    emptySettlements: "Nie masz jeszcze zapisanych rozliczeń.",
    exportCsv: "Eksportuj CSV",
    importCsv: "Importuj CSV",
    importSuccess: "Zaimportowano {count} rozliczeń.",
    importError: "Nie udało się zaimportować pliku CSV. Sprawdź, czy pochodzi z tej aplikacji.",
    csvSubject: "Czego dotyczy",
    csvExpenseDate: "Dzień wydatku",
    csvAmount: "Kwota",
    csvCurrency: "Waluta",
    csvRate: "Kurs NBP",
    csvRateDate: "Data kursu",
    csvTable: "Tabela NBP",
    csvResult: "Wynik PLN",
    expense: "Wydatek",
    rate: "Kurs NBP",
    actions: "Akcje",
    remove: "Usuń",
    footerRates: "Kursy walut pochodzą z",
    footerTable: "Narodowy Bank Polski, tabela A",
    footerCopyright: "© 2023 Creative Rates",
  },
  en: {
    brandTagline: "Polish currency rates",
    homeLabel: "Złoty the King — home page",
    convertLink: "Convert currency",
    calculator: "Calculator",
    settlements: "Settlements",
    viewLabel: "Application view",
    pageTitle: "Polish złoty exchange rates",
    pageDescription: "Convert currencies to PLN using average rates from Narodowy Bank Polski.",
    unavailableTitle: "Exchange rates are temporarily unavailable",
    unavailableDescription: "We couldn't load the latest NBP table. Try refreshing the page in a moment.",
    convertTitle: "Convert to PLN",
    nbpTable: "NBP table",
    amount: "Amount",
    currency: "Currency",
    result: "Result",
    invalidAmount: "Enter a non-negative amount with up to two decimal places.",
    rateEquals: "1 {currency} = {rate} PLN",
    newSettlement: "New settlement",
    nextRateHelp: "The rate will come from the first NBP table published after the expense date — including after a weekend.",
    subject: "What is it for",
    expenseDate: "Expense date",
    namePlaceholder: "e.g. Berlin business trip",
    amountPlaceholder: "0.00",
    save: "Save settlement",
    saving: "Loading rate…",
    fillError: "Enter a name, valid amount, currency and expense date.",
    futureDate: "A future date cannot be selected.",
    fetchError: "Could not load the NBP rate for the selected date.",
    missingRate: "No rate is available for the selected currency.",
    savedSettlements: "Saved settlements",
    localStorageHelp: "Data is stored locally in this browser.",
    emptySettlements: "You don't have any saved settlements yet.",
    exportCsv: "Export CSV",
    importCsv: "Import CSV",
    importSuccess: "Imported {count} settlements.",
    importError: "The CSV file could not be imported. Check that it was exported by this app.",
    csvSubject: "Subject",
    csvExpenseDate: "Expense date",
    csvAmount: "Amount",
    csvCurrency: "Currency",
    csvRate: "NBP rate",
    csvRateDate: "Rate date",
    csvTable: "NBP table",
    csvResult: "Result PLN",
    expense: "Expense",
    rate: "NBP rate",
    actions: "Actions",
    remove: "Remove",
    footerRates: "Exchange rates from",
    footerTable: "Narodowy Bank Polski, table A",
    footerCopyright: "© 2023 Creative Rates",
  },
} as const;

type TranslationKey = keyof typeof messages.en;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pl");

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("zloty-the-king:locale");
    if (storedLocale === "pl" || storedLocale === "en") {
      startTransition(() => setLocaleState(storedLocale));
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    window.localStorage.setItem("zloty-the-king:locale", locale);
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale: setLocaleState,
    t: (key) => messages[locale][key],
  }), [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLanguage() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
