import React, { useState } from "react";
import { useAtom, useSetAtom, useAtomValue } from "jotai";

import Button from "../components/Button";
import ToolCard from "../components/ToolCard";
import TextInput from "../components/TextInput";
import Modal from "../components/Modal";

import { homeMapAtom, mapPopupAtom } from "./HomeMap";
import { visiblePanelAtom, selectedDatesAtom } from "../home";
import { URLS } from "../constants";
import { jsonRequest } from "../utils";
import { addPopup, fitMap, selectedLatLngAtom } from "./HomeMap";
import { useTranslation } from "react-i18next";

export default function ReportMinesPanel({ active }) {
  const [mapPopup, _setMapPopup] = useAtom(mapPopupAtom);
  const [visiblePanel, _setVisiblePanel] = useAtom(visiblePanelAtom);
  const [selectedDates, _setSelectedDates] = useAtom(selectedDatesAtom);
  const homeMap = useAtomValue(homeMapAtom);
  const [selectedLatLng, setSelectedLatLng] = useAtom(selectedLatLngAtom);
  const setMapPopup = useSetAtom(mapPopupAtom);

  const [latLonText, setLatLonText] = useState("");
  const [messageBox, setMessageBox] = useState(null);
  const [reportedLatLng, setReportedLatLng] = useState(null);
  const [reportingMine, setReportingMine] = useState(false);

  const reported = reportedLatLng === selectedLatLng;

  const { t } = useTranslation();

  const showAlert = ({ body, closeText, confirmText, onConfirm, title }) =>
    setMessageBox({
      body,
      closeText,
      confirmText,
      onConfirm,
      title,
    });

  /// API Calls ///

  const submitMine = () => {
    if (selectedLatLng) {
      const [lat, lon] = selectedLatLng;
      setReportingMine(true);
      jsonRequest(URLS.REPORT_MINE, { lat, lon })
        .then((result) => {
          if (result === "") {
            setReportedLatLng(selectedLatLng);
            showAlert({
              body: report.created,
              closeText: report.understand,
              title: report.createdTitle,
            });
          } else if (result === "Exists") {
            showAlert({
              body: report.existing,
              closeText: report.understand,
              title: report.existingTitle,
            });
          } else if (result === "Outside") {
            showAlert({
              body: report.outside,
              closeText: report.understand,
              title: report.outsideTitle,
            });
          } else {
            showAlert({
              body: report.error,
              closeText: report.understand,
              title: report.errorTitle,
            });
          }
        })
        .catch((error) => console.error(error))
        .finally(() => setReportingMine(false));
    } else {
      alert("You must select a location to continue.");
    }
  };

  /// Helper functions ///
  const processLatLng = () => {
    const pair = latLonText.split(",");
    const [lat, lng] = pair.map((a) => parseFloat(a)).slice(0, 2);
    if (lat && lng) {
      // TODO, these probably dont need to be three functions
      setSelectedLatLng([lat, lng]);
      setMapPopup(
        addPopup(homeMap, { lat, lon }, mapPopup, visiblePanel, selectedDates, localeText)
      );
      fitMap(homeMap, "point", [lng, lat], home);
    }
  };

  return (
    <ToolCard title={t("report.title")} active={active}>
      {t("report.subTitle")}
      <TextInput
        style={{ marginTop: "3rem" }}
        id="inputCoords"
        label={t("report.coordLabel")}
        onChange={(e) => setLatLonText(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") processLatLng();
        }}
        render={() => <Button onClick={processLatLng}>{t("report.goButton")}</Button>}
        value={latLonText}
      />
      <h3 style={{ marginTop: "1rem" }}>{t("report.selectedLocation")}</h3>
      {selectedLatLng ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>
              <b>{t("report.latitude")}:</b> {selectedLatLng[0]}
            </span>
            <span>
              <b>{t("report.longitude")}:</b> {selectedLatLng[1]}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() =>
                showAlert({
                  body: report.areYouSure,
                  closeText: report.cancel,
                  confirmText: report.imSure,
                  onConfirm: () => submitMine(),
                  title: report.submit,
                })
              }
              isDisabled={reportingMine || reported}
            >
              {reported ? t("report.reported ") : t("report.submit")}
            </Button>
          </div>
        </>
      ) : (
        <span style={{ fontStyle: "italic" }}>{t("report.noLocation")}</span>
      )}
      {messageBox && (
        <Modal {...messageBox} onClose={() => setMessageBox(null)}>
          <p>{messageBox.body}</p>
        </Modal>
      )}
    </ToolCard>
  );
}
