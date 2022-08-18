import React from "react";

import Button from "../components/Button";
import ToolPanel from "../components/ToolPanel";
import TextInput from "../components/TextInput";
import Modal from "../components/Modal";

import { MainContext } from "../components/PageLayout";
import { URLS } from "../constants";
import { jsonRequest } from "../utils";

export default class ReportMinesPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latLonText: "",
      messageBox: null,
      reportedLatLon: null,
      reportingMine: false,
    };
  }

  showAlert = ({ body, closeText, confirmText, onConfirm, title }) =>
    this.setState({
      messageBox: {
        body,
        closeText,
        confirmText,
        onConfirm,
        title,
      },
    });

  /// API Calls ///

  submitMine = () => {
    const { selectedLatLon } = this.props;
    const {
      localeText: { report },
    } = this.context;
    const [lat, lon] = selectedLatLon;
    if (lat && lon) {
      this.setState({ reportingMine: true });
      jsonRequest(URLS.REPORT_MINE, { lat, lon })
        .then((result) => {
          if (result === "") {
            this.setState({ reportedLatLon: selectedLatLon });
            this.showAlert({
              body: report.created,
              closeText: report.understand,
              title: report.createdTitle,
            });
          } else if (result === "Exists") {
            this.showAlert({
              body: report.existing,
              closeText: report.understand,
              title: report.existingTitle,
            });
          } else if (result === "Outside") {
            this.showAlert({
              body: report.outside,
              closeText: report.understand,
              title: report.outsideTitle,
            });
          } else {
            this.showAlert({
              body: report.error,
              closeText: report.understand,
              title: report.errorTitle,
            });
          }
        })
        .catch((error) => console.error(error))
        .finally(() => this.setState({ reportingMine: false }));
    } else {
      alert("You must select a location to continue.");
    }
  };

  /// Helper functions ///
  processLatLng = () => {
    const { latLonText } = this.state;
    const { fitMap, addPopup } = this.props;
    const pair = latLonText.split(",");
    const [lat, lon] = pair.map((a) => parseFloat(a)).slice(0, 2);
    if (lat && lon) {
      // TODO, these probably dont need to be three functions
      addPopup(lat, lon);
      fitMap("point", [lon, lat]);
    }
  };

  render() {
    const { latLonText, reportingMine, reportedLatLon } = this.state;
    const { selectedLatLon } = this.props;
    const {
      localeText: { report },
    } = this.context;

    const reported = reportedLatLon === selectedLatLon;
    return (
      <ToolPanel title={report.title}>
        {report.subTitle}
        <TextInput
          style={{ marginTop: "3rem" }}
          id="inputCoords"
          label={report.coordLabel}
          onChange={(e) => this.setState({ latLonText: e.target.value })}
          onKeyUp={(e) => {
            if (e.key === "Enter") this.processLatLng();
          }}
          render={() => <Button buttonText={report.goButton} clickHandler={this.processLatLng} />}
          value={latLonText}
        />
        <h3 style={{ marginTop: "1rem" }}>{report.selectedLocation}</h3>
        {selectedLatLon ? (
          <>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>
                <b>{report.latitude}:</b> {selectedLatLon[0]}
              </span>
              <span>
                <b>{report.longitude}:</b> {selectedLatLon[1]}
              </span>
            </div>

            <div style={{ display: "flex", width: "100%", justifyContent: "flex-end" }}>
              <Button
                buttonText={reported ? report.reported : report.submit}
                clickHandler={() =>
                  this.showAlert({
                    body: report.areYouSure,
                    closeText: report.cancel,
                    confirmText: report.imSure,
                    onConfirm: () => this.submitMine(),
                    title: report.submit,
                  })
                }
                isDisabled={reportingMine || reported}
              />
            </div>
          </>
        ) : (
          <span style={{ fontStyle: "italic" }}>{report.noLocation}</span>
        )}
        {this.state.messageBox && (
          <Modal {...this.state.messageBox} onClose={() => this.setState({ messageBox: null })}>
            <p>{this.state.messageBox.body}</p>
          </Modal>
        )}
      </ToolPanel>
    );
  }
}
ReportMinesPanel.contextType = MainContext;
