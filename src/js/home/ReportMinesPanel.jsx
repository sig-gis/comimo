import React, { useState, useContext } from "react";

import Button from "../components/Button";
import ToolCard from "../components/ToolCard";
import TextInput from "../components/TextInput";
import Modal from "../components/Modal";

import { MainContext } from "../components/PageLayout";
import { URLS } from "../constants";
import { jsonRequest } from "../utils";

export default function ReportMinesPanel({ selectedLatLon, fitMap, addPopup, active }) {
  const [latLonText, setLatLonText] = useState("");
  const [messageBox, setMessageBox] = useState(null);
  const [reportedLatLon, setReportedLatLon] = useState(null);
  const [reportingMine, setReportingMine] = useState(false);

  const [lat, lon] = selectedLatLon;
  const reported = reportedLatLon === selectedLatLon;

  const {
    localeText: { report },
  } = useContext(MainContext);

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
    if (lat && lon) {
      setReportingMine(true);
      jsonRequest(URLS.REPORT_MINE, { lat, lon })
        .then((result) => {
          if (result === "") {
            setReportedLatLon(selectedLatLon);
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
    const [lat, lon] = pair.map((a) => parseFloat(a)).slice(0, 2);
    if (lat && lon) {
      // TODO, these probably dont need to be three functions
      // addPopup(map, lat, lon);
      // fitMap("point", [lon, lat]);
    }
  };

  return (
    <ToolCard title={report?.title} active={active}>
      {report?.subTitle}
      <TextInput
        style={{ marginTop: "3rem" }}
        id="inputCoords"
        label={report?.coordLabel}
        onChange={(e) => setLatLonText(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") this.processLatLng();
        }}
        render={() => <Button onClick={processLatLng}>{report?.goButton}</Button>}
        value={latLonText}
      />
      <h3 style={{ marginTop: "1rem" }}>{report?.selectedLocation}</h3>
      {selectedLatLon ? (
        <>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span>
              <b>{report?.latitude}:</b> {selectedLatLon[0]}
            </span>
            <span>
              <b>{report?.longitude}:</b> {selectedLatLon[1]}
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
                  onConfirm: () => this.submitMine(),
                  title: report.submit,
                })
              }
              isDisabled={reportingMine || reported}
            >
              {reported ? report?.reported : report?.submit}
            </Button>
          </div>
        </>
      ) : (
        <span style={{ fontStyle: "italic" }}>{report?.noLocation}</span>
      )}
      {messageBox && (
        <Modal {...messageBox} onClose={() => setMessageBox(null)}>
          <p>{messageBox.body}</p>
        </Modal>
      )}
    </ToolCard>
  );
}
