import React from "react";

import {MainContext} from "./context";

export default class ReportMinesPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latLonText: "",
      reportedLatLon: null,
      reportingMine: false
    };
  }

  /// API Calls ///

  submitMine = () => {
    const {selectedLatLon} = this.props;
    const {localeText: {report}} = this.context;
    const [lat, lon] = selectedLatLon;
    if (lat && lon) {
      this.setState({reportingMine: true});
      fetch("report-mine",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({lat, lon})
            })
        .then(result => result.json())
        .then(result => {
          if (result === "") {
            this.setState({reportedLatLon: selectedLatLon});
            alert(report.created);
          } else if (result === "Exists") {
            alert(report.existing);
          } else if (result === "Outside") {
            alert(report.outside);
          } else {
            alert(report.error);
          }
        })
        .catch(error => console.error(error))
        .finally(() => this.setState({reportingMine: false}));
    } else {
      alert("You must select a location to continue.");
    }
  };

  /// Helper functions ///

  processLatLng = () => {
    const {latLonText} = this.state;
    const {fitMap, addPopup} = this.props;
    const pair = latLonText.split(",");
    const [lat, lon] = pair
      .map(a => parseFloat(a))
      .slice(0, 2);
    if (lat && lon) {
      // TODO, these probably dont need to be three functions
      addPopup(lat, lon);
      fitMap("point", [lon, lat]);
    }
  };

  render() {
    const {latLonText, reportingMine, reportedLatLon} = this.state;
    const {isHidden, selectedLatLon} = this.props;
    const {localeText: {report}} = this.context;

    const reported = reportedLatLon === selectedLatLon;
    return (
      <div className={"popup-container search-panel " + (isHidden ? "see-through" : "")}>
        <h3>{report.title}</h3>
        {report.subTitle}
        <label>{report.coordLabel}</label>
        <div className="d-flex">
          <input
            className="w_100"
            onChange={e => this.setState({latLonText: e.target.value})}
            onKeyUp={e => { if (e.key === "Enter") this.processLatLng(); }}
            value={latLonText}
          />
          <button className="map-upd-btn" onClick={this.processLatLng} type="button">
            {report.goButton}
          </button>
        </div>
        <h3 className="mt-3">{report.selectedLocation}</h3>
        {selectedLatLon
          ? (
            <>
              <span><b>{report.latitude}:</b> {selectedLatLon[0]}</span>
              <span><b>{report.longitude}:</b> {selectedLatLon[1]}</span>
              <div style={{display: "flex", width: "100%", justifyContent: "flex-end"}}>
                <button
                  className="btn map-upd-btn mt-1"
                  disabled={reportingMine || reported}
                  onClick={this.submitMine}
                  type="button"
                >
                  {reported ? report.reported : report.submit}
                </button>
              </div>
            </>
          ) : (
            <span style={{fontStyle: "italic"}}>{report.noLocation}</span>
          )}
      </div>
    );
  }
}
ReportMinesPanel.contextType = MainContext;
