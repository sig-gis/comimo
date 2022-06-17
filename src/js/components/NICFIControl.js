import React, {useEffect, useState} from "react";

import Button from "./Button";
import Select from "./Select";

export default function NICFIControl({extraParams, setParams, nicfiLayers}) {
  const [selectedTime, setTime] = useState("");
  const [selectedBand, setBand] = useState("");
  useEffect(() => {
    if (extraParams.NICFI) {
      setTime(extraParams.NICFI.dataLayer);
      setBand(extraParams.NICFI.band);
    }
  }, [extraParams]);

  return (
    <div className="flex flex-col pl-3">
      <Select
        id="time"
        label="Select Time"
        onChange={e => setTime(e.target.value)}
        options={nicfiLayers.map(time => ({value: time, label: time.slice(34, time.length - 7)}))}
        value={selectedTime}
      />
      <div className="flex flex-col">
        <label className="mb-0 mr-3">Select Band</label>
        <div className="flex">
          <div>
            <input
              checked={selectedBand === "rgb"}
              id="visible"
              onChange={() => setBand("rgb")}
              type="radio"
            />
            <label htmlFor="visible">
            Visible
            </label>
          </div>
          <div className="pl-2">
            <input
              checked={selectedBand === "cir"}
              id="infrared"
              onChange={() => setBand("cir")}
              type="radio"
            />
            <label htmlFor="infrared">
            Infrared
            </label>
          </div>
        </div>
      </div>
      <Button
        className="mt-4"
        onClick={() => setParams(
          "NICFI",
          {
            dataLayer: selectedTime,
            band: selectedBand
          }
        )}
      >
          Update Map
      </Button>
    </div>
  );
}
