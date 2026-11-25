import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Hero from "@/components/Hero";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Złoty the King",
  description: "Convert foreign currencies to Polish złoty using NBP exchange rates.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body id="top" className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-950 dark:bg-slate-950 dark:text-white">
        <LanguageProvider>
          <NavBar />
          <Hero />
          <main className="flex flex-1 flex-col items-center px-4 py-8 sm:py-12">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
