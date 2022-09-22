import React, { useEffect, useState } from "react";

import PopupMapInfo from "../components/PopupMapInfo";
import { jsonRequest, toPrecision } from "../utils";
import { URLS, availableLayers } from "../constants";
import { useTranslation } from "react-i18next";

export default function InfoPopupContent({ map, lat, lng, selectedDates }) {
  const [layerInfo, setLayerInfo] = useState({});

  const { t } = useTranslation();

  const visibleLayers = availableLayers.filter(
    (layer) => map && map.getLayer(layer).visibility === "visible"
  );

  useEffect(() => {
    if (visibleLayers.length > 0) {
      jsonRequest(URLS.GET_INFO, { lng, lat, dates: selectedDates, visibleLayers })
        .then((resp) => {
          setLayerInfo(resp);
        })
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
        <span>
          <strong>{t("home.nMines")}: </strong>{" "}
          {nMines ? t("home.eeLayerDetected") : t("home.eeLayerNotDetected")}
        </span>
      </PopupMapInfo>
    ),
    pMines: (
      <PopupMapInfo key="pMines">
        <span>
          <strong>{t("home.pMines")}: </strong>
          {pMines ? t("home.eeLayerDetected") : t("home.eeLayerNotDetected")}
        </span>
      </PopupMapInfo>
    ),
    cMines: (
      <PopupMapInfo key="cMines">
        <span>
          <strong>{t("home.cMines")}: </strong>
          {cMines ? t("home.eeLayerDetected") : t("home.eeLayerNotDetected")}
        </span>
      </PopupMapInfo>
    ),
    municipalBounds: (
      <PopupMapInfo key="municipalBounds">
        <span>
          <strong>{t("home.municipalBoundsPopup")}: </strong>
          {municipalBounds
            ? municipalBounds[0] + ", " + municipalBounds[1]
            : t("home.municipalBoundsNotFound")}
        </span>
      </PopupMapInfo>
    ),
    protectedAreas: protectedAreas && (
      <PopupMapInfo key="protectedAreas">
        <span>
          <strong>{t("home.protectedAreasPopup")}: </strong>
          {t("home.protectedAreasCategory")}: {protectedAreas[0]}, {t("home.protectedAreasName")}:{" "}
          {protectedAreas[1]}
        </span>
      </PopupMapInfo>
    ),
    otherAuthorizations: otherAuthorizations && (
      <PopupMapInfo key="otherAuthorizations">
        <span>
          <strong>{t("home.otherAuthorizationsPopup")}: </strong>
          {otherAuthorizations}
        </span>
      </PopupMapInfo>
    ),
    legalMines: legalMines && (
      <PopupMapInfo key="legalMines">
        <span>
          <strong>{t("home.legalMinesPopup")}: </strong>
          {legalMines}
        </span>
      </PopupMapInfo>
    ),
    tierrasDeCom: tierrasDeCom && (
      <PopupMapInfo key="tierrasDeCom">
        <span>
          <strong>{t("home.tierrasDeComPopup")}: </strong>
          {tierrasDeCom}
        </span>
      </PopupMapInfo>
    ),
    resguardos: resguardos && (
      <PopupMapInfo key="visibleLayers">
        <span>
          <strong>{t("home.resguardosPopup")}: </strong>
          {resguardos}
        </span>
      </PopupMapInfo>
    ),
  };

  return Object.keys(layerInfo).length === visibleLayers.length ? (
    <div style={{ display: "flex", flexDirection: "column", marginRight: "0.5rem" }}>
      <PopupMapInfo key="latlng">
        <span>
          <strong>Lat, Long: </strong> {toPrecision(lat, 4)}, {toPrecision(lng, 4)}
        </span>
      </PopupMapInfo>
      {visibleLayers.map((l) => layerToInfo[l])}
    </div>
  ) : (
    <div>Loading...</div>
  );
}
