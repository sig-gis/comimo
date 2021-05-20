import React from "react";

import {MainContext} from "./context";

export default class ReportMinesPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latLonText: ""
    };
  }

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
    const {latLonText} = this.state;
    const {isHidden, selectedLatLon, submitMine} = this.props;
    const {localeText: {report}} = this.context;

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
                  onClick={submitMine}
                  type="button"
                >
                  {report.submit}
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
