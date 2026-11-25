"use client";

import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-5 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <p>{t("footerRates")} {" "}<a href="https://nbp.pl/statystyka-i-sprawozdawczosc/kursy/tabela-a/" className="underline underline-offset-2">{t("footerTable")}</a></p>
      <p className="mt-2">{t("footerCopyright")}</p>
    </footer>
  );
}
