import React from "react";

export default function ReportPopupContent({lat, lon, localeText: {report}}) {
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
      <label><b>{report.latitude}</b>:</label>
      <label>{lat}</label>
      <label><b>{report.longitude}</b>:</label>
      <label>{lon}</label>
    </div>
  );
}
