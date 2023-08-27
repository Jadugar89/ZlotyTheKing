import React from "react";

const Footer = () => {
  return (
    <div className="fixed bottom-0 w-full h-50 bg-white text-center">
      <h3 className="text-2xl font-extrabold m-2">
        &copy; 2023 Creative Rates
      </h3>
      <p className="font-bold p-4">
        Current average exchange rates of foreign currencies in zlotys defined
        in § 2 para. 1 and 2 of the Resolution No. 51/2002 of the Management
        Board of Narodowy Bank Polski of 23 September 2002 on the way of
        calculating and announcing current exchange rates of foreign currencies
        (Dziennik Urzędowy NBP of 2023 item 1){" "}
      </p>
    </div>
  );
};

export default Footer;
