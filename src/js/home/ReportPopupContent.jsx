import React from "react";
import { useTranslation } from "react-i18next";

import PopupMapInfo from "../components/PopupMapInfo";
import { toPrecision } from "../utils";

export default function ReportPopupContent({ lat, lng }) {
  return (
    <PopupMapInfo style={{ marginRight: "0.5rem" }}>
      <span>
        <strong>Lat, Long: </strong> {toPrecision(lat, 4)}, {toPrecision(lng, 4)}
      </span>
    </PopupMapInfo>
  );
}
