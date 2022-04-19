import React from "react";

import PopupMapInfo from "../components/PopupMapInfo";

export default function ReportPopupContent({lat, lon, localeText: {report}}) {
  return (
    <PopupMapInfo>
      <label><b>{report.latitude}</b>:</label>
      <label>{lat}</label>
      <label><b>{report.longitude}</b>:</label>
      <label>{lon}</label>
    </PopupMapInfo>
  );
}
