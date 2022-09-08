import React from "react";
import { useTranslation } from "react-i18next";

import PopupMapInfo from "../components/PopupMapInfo";
import { toPrecision } from "../utils";

export default function ReportPopupContent({ lat, lng }) {
  const { t } = useTranslation();
  return (
    <PopupMapInfo>
      <label>
        <b>{t("report.latitude")}</b>:
      </label>
      <label>{toPrecision(lat, 4)}</label>
      <label>
        <b>{t("report.longitude")}</b>:
      </label>
      <label>{toPrecision(lng, 4)}</label>
    </PopupMapInfo>
  );
}
