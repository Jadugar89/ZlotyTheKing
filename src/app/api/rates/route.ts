import { getCurrencyTableForSettlementDate } from "@/lib/nbp";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "A valid expense date is required" }, { status: 400 });
  }

  const table = await getCurrencyTableForSettlementDate(date);

  if (!table) {
    return NextResponse.json(
      { error: "No NBP exchange rate is available after the selected date" },
      { status: 404 },
    );
  }

  return NextResponse.json(table);
}
