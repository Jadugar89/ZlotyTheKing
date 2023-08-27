"use client";

import Calculator from "@/components/Calculator";
import { Button } from "@/components/UI/Button";
import DropDownList from "@/components/UI/DropDownList";
import { CurrencyTable } from "@/types";
import { CONFIG_FILES } from "next/dist/shared/lib/constants";
import Image from "next/image";

async function getData(): Promise<CurrencyTable> {
  const res = await fetch(
    "https://api.nbp.pl/api/exchangerates/tables/a?format=json"
  );
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  let data: Array<CurrencyTable> = await res.json();
  return data[0];
}

export default async function Home() {
  const data = await getData();
  const handleScroll = () => {
    const nextSection = document.getElementById("discover");

    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <div className="container flex max-w-[64rem] flex-col items-center text-center">
      <h1 className='class="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl"'>
        Get Current Rate of Polish Zloty!{" "}
      </h1>
      <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
        Rates are provide by NBP
      </p>
      <Button className="m-2" onClick={handleScroll}>
        Check Rate!
      </Button>
      <Calculator currencyTable={data} />
    </div>
  );
}
