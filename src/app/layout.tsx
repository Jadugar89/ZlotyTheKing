import "./globals.css";
import { Inter } from "next/font/google";
import Hero from "@/components/Hero";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Currency Calculator",
  description: "Polish Zloty King",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col">
          <Hero />
          <NavBar />
          <main className="flex min-h-screen flex-col items-center justify-between p-4">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
