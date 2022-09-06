import React, { isValidElement, useEffect, useState } from "react";

import PopupMapInfo from "../components/PopupMapInfo";
import { jsonRequest, toPrecision } from "../utils";
import { URLS, availableLayers } from "../constants";
import { MainContext, localeTextAtom } from "../components/PageLayout";
import { useAtom, useAtomValue } from "jotai";
import { selectedDatesAtom } from "../home";
import { useTranslation } from "react-i18next";

export default function InfoPopupContent({ map, lat, lng, selectedDates }) {
  const [layerInfo, setLayerInfo] = useState({});
  const localeText = useAtomValue(localeTextAtom);

  const { t, i18n } = useTranslation();

  const visibleLayers = availableLayers.filter(
    (layer) => map.getLayer(layer).visibility === "visible"
  );

  useEffect(() => {
    if (visibleLayers.length > 0) {
      jsonRequest(URLS.GET_INFO, { lng, lat, dates: selectedDates, visibleLayers })
        .then((resp) => setLayerInfo(resp))
        .catch((err) => console.error(err));
    }
  }, []);

  const {
    nMines,
    pMines,
    cMines,
    municipalBounds,
    protectedAreas,
    otherAuthorizations,
    legalMines,
    tierrasDeCom,
    resguardos,
  } = layerInfo;

  const layerToInfo = {
    nMines: (
      <PopupMapInfo key="nMines">
        <label>
          <strong>{t("home.nMines")}: </strong>
        </label>
        <label>{nMines ? t("home.eeLayerDetected") : t("home.eeLayerNotDetected")}</label>
      </PopupMapInfo>
    ),
    pMines: (
      <PopupMapInfo key="pMines">
        <label>
          <strong>{t("home.pMines")}: </strong>
        </label>
        <label>{pMines ? t("home.eeLayerDetected") : t("home.eeLayerNotDetected")}</label>
      </PopupMapInfo>
    ),
    cMines: (
      <PopupMapInfo key="cMines">
        <label>
          <strong>{t("home.cMines")}: </strong>
        </label>
        <label>{cMines ? t("home.eeLayerDetected") : t("home.eeLayerNotDetected")}</label>
      </PopupMapInfo>
    ),
    municipalBounds: (
      <PopupMapInfo key="municipalBounds">
        <label>
          <strong>{t("home.municipalBoundsPopup")}: </strong>
        </label>
        <label>
          {municipalBounds
            ? municipalBounds[0] + ", " + municipalBounds[1]
            : t("home.municipalBoundsNotFound")}
        </label>
      </PopupMapInfo>
    ),
    protectedAreas: protectedAreas && (
      <PopupMapInfo key="protectedAreas">
        <label>
          {" "}
          <strong>{t("home.protectedAreasPopup")}:</strong>
        </label>
        <label>{t("home.protectedAreasCategory")}:</label>
        <label> {protectedAreas[0]}</label>
        <label>{t("home.protectedAreasName")}:</label>
        <label>{protectedAreas[1]}</label>
      </PopupMapInfo>
    ),
    otherAuthorizations: otherAuthorizations && (
      <PopupMapInfo key="otherAuthorizations">
        <label>
          <strong>{t("home.otherAuthorizationsPopup")}: </strong>
        </label>
        <label>{otherAuthorizations}</label>
      </PopupMapInfo>
    ),
    legalMines: legalMines && (
      <PopupMapInfo key="legalMines">
        <label>
          <strong>{t("home.legalMinesPopup")}: </strong>
        </label>
        <label>{legalMines}</label>
      </PopupMapInfo>
    ),
    tierrasDeCom: tierrasDeCom && (
      <PopupMapInfo key="tierrasDeCom">
        <label>
          <strong>{t("home.tierrasDeComPopup")}: </strong>
        </label>
        <label>{tierrasDeCom}</label>
      </PopupMapInfo>
    ),
    resguardos: resguardos && (
      <PopupMapInfo key="visibleLayers">
        <label>
          <strong>{t("home.resguardosPopup")}: </strong>
        </label>
        <label>{resguardos}</label>
      </PopupMapInfo>
    ),
  };

  return Object.keys(layerInfo).length === visibleLayers.length ? (
    <div style={{ display: "flex", flexDirection: "column", marginRight: "0.5rem" }}>
      <PopupMapInfo key="latlng">
        <label>
          <strong>Lat: </strong> {toPrecision(lat, 4)}
          <span>, </span>
          <strong>Lng: </strong> {toPrecision(lng, 4)}
        </label>
      </PopupMapInfo>
      {visibleLayers.map((l) => layerToInfo[l])}
    </div>
  ) : (
    <div>Loading...</div>
  );
}
