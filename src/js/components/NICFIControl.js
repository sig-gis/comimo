import React, {useEffect, useState} from "react";

import Button from "./Button";

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
    <div className="m-3 d-flex flex-column">
      <div className="d-flex mb-2">
        <label className="mb-0 mr-3" htmlFor="time-selection">Select Time</label>
        <select
          id="time-selection"
          onChange={e => setTime(e.target.value)}
          value={selectedTime}
        >
          {nicfiLayers.map(time => <option key={time} value={time}>{time.slice(34, time.length - 7)}</option>)}
        </select>
      </div>
      <div className="d-flex mb-2 align-items-center">
        <label className="mb-0 mr-3">Select Band</label>
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
        <div>
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
      <div className="w-100">
        <Button
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
    </div>
  );
}
