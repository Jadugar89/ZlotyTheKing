import { Rate } from "@/types";
import { CONFIG_FILES } from "next/dist/shared/lib/constants";
import React, { useState } from "react";
import { Button } from "./Button";

interface DropDownListProps {
  data: Array<Rate>;
  btnText: string;
  clickHandler: (item: Rate) => void;
}

const DropDownList: React.FC<DropDownListProps> = ({
  data,
  clickHandler,
  btnText,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  function HandleToogle() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="w-full">
      <Button
        onClick={HandleToogle}
        id="dropdownInformationButton"
        data-dropdown-toggle="dropdownInformation"
        className="w-full text-sm px-5 py-2.5 justify-between text-center inline-flex items-center dark:bg-blue-
            dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        {btnText}
        <svg
          className="w-2.5 h-2.5 ml-2.5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </Button>
      {isOpen && (
        <div
          onMouseLeave={HandleToogle}
          onClick={HandleToogle}
          id="dropdownInformation"
          className="absolute z-10  overflow-auto h-32 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
        >
          <ul
            className="py-2 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownInformationButton"
          >
            {data.map((item, index) => (
              <li
                className="hover:bg-blue-500"
                onClick={() => clickHandler(item)}
                key={index}
              >
                <div>
                  <p>{item.code}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropDownList;
