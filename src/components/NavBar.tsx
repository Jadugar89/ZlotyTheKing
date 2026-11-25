"use client";

import { useLanguage } from "@/lib/i18n";

export default function NavBar() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <header className="border-b border-slate-800 bg-slate-950 text-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <a href="#top" className="flex min-w-0 items-center gap-3" aria-label={t("homeLabel")}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-lg font-black text-slate-950 shadow-lg shadow-amber-400/20">zł</span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold tracking-tight sm:text-lg">Złoty the King</span>
            <span className="block text-xs font-medium text-slate-400">{t("brandTagline")}</span>
          </span>
        </a>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <a href="#discover" onClick={() => window.dispatchEvent(new Event("open-calculator"))} className="hidden rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-amber-300 hover:text-amber-300 sm:inline-flex">{t("convertLink")}</a>
          <div className="flex rounded-full border border-slate-700 p-1 text-xs font-bold" aria-label="Language">
            {(["pl", "en"] as const).map((option) => (
              <button key={option} type="button" onClick={() => setLocale(option)} className={`rounded-full px-2.5 py-1.5 uppercase transition ${locale === option ? "bg-amber-400 text-slate-950" : "text-slate-400 hover:text-white"}`} aria-pressed={locale === option}>{option}</button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
