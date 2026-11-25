import CurrencyWorkspace from "@/components/CurrencyWorkspace";
import { getCurrencyTable } from "@/lib/nbp";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  return <CurrencyWorkspace currencyTable={await getCurrencyTable()} />;
}
