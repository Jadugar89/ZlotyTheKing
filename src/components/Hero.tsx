"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n";

export default function Hero() {
  const { locale } = useLanguage();
  return (
    <div className="relative h-28 overflow-hidden bg-slate-900 sm:h-40">
      <Image src="/finance.jpg" alt="" fill sizes="100vw" className="object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/30 to-blue-950/70" />
      <div className="relative mx-auto flex h-full max-w-5xl items-center px-5 sm:px-8">
        <p className="max-w-md text-sm font-medium tracking-wide text-white/90 sm:text-base">
          {locale === "pl" ? "Proste i szybkie przeliczanie walut według kursów NBP." : "Simple and fast currency conversion using NBP rates."}
        </p>
      </div>
    </div>
  );
}
