import React, { ChangeEvent, useRef, useState } from "react";
import DropDownList from "./UI/DropDownList";
import { CurrencyTable, Rate } from "@/types";

interface CalculatorProps {
  currencyTable: CurrencyTable;
}

const Calculator: React.FC<CalculatorProps> = ({ currencyTable }) => {
  const ref = useRef<HTMLInputElement>();
  const [rate, setFrom] = useState<Rate>(currencyTable.rates[1]);
  const [calcValue, setCalcValue] = useState(0);
  function OnClickFrom(item: Rate) {
    setFrom(item);
    const inputElement = ref.current;
    if (inputElement) {
      if (inputElement.valueAsNumber)
        setCalcValue(inputElement.valueAsNumber * item.mid);
    }
  }
  function Calc(event: ChangeEvent<HTMLInputElement>) {
    let value: number = event.target.valueAsNumber;
    if (!value) {
      value = 0;
    }

    setCalcValue(value * rate.mid);
  }

  return (
    <div
      className="flex flex-col h-min bg-slate-200 border-blue-500 border-2 mt-12 p-2"
      id="discover"
    >
      <div className="flex justify-between">
        <h3 className="text-left font-bold">Convert</h3>
        {rate.mid != 0 && <p>Current Rate {rate.mid} PLN</p>}
      </div>

      <div className="flex flex-col sm:flex-row">
        <div className="w-1/3">
          <label className="block mb-2 p-1 text-left text-sm font-medium text-gray-900 dark:text-white">
            Amount
          </label>
          <input
            ref={ref}
            type="number"
            min="0"
            step="0.01"
            onChange={Calc}
            className=" bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5
             dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="w-1/3 ml-2">
          <label className="block mb-2 p-1 text-left text-sm font-medium text-gray-900 dark:text-white">
            Currency
          </label>
          <DropDownList
            clickHandler={OnClickFrom}
            data={currencyTable.rates}
            btnText={rate.code}
          ></DropDownList>
        </div>
        <div className="w-1/3 ml-2">
          <label className="block mb-2 p-1 text-left text-sm font-medium text-gray-900 dark:text-white">
            Result
          </label>
          <input
            type="text"
            value={calcValue.toFixed(2)}
            readOnly
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default Calculator;
