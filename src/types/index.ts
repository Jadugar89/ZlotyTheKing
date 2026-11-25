export interface Rate {
  currency: string;
  code: string;
  mid: number;
}

export interface CurrencyTable {
  table: "A";
  no: string;
  effectiveDate: string;
  rates: [Rate, ...Rate[]];
}

export interface SettlementRecord {
  id: string;
  name: string;
  amount: string;
  currencyCode: string;
  expenseDate: string;
  rateDate: string;
  tableNo: string;
  rate: number;
  result: number;
}
