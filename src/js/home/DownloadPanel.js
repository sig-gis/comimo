import React from "react";

import ToolPanel from "../components/ToolPanel";

import Button from "../components/Button";

import {jsonRequest} from "../utils";
import {MainContext, URLS} from "./constants";

export default class DownloadPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clipOption: 1,
      downloadURL: false,
      fetching: false,
      mineType: "cMines"
    };
  }

  getDownloadUrl = () => {
    const {selectedRegion, selectedDates} = this.props;
    const {clipOption, mineType} = this.state;
    this.setState({fetching: true});

    const [level, region] = clipOption === 1 ? ["", "all"] : selectedRegion.split("_", 1);
    jsonRequest(URLS.MAPQUEST, {level, region, dataLayer: selectedDates[mineType]})
      .then(res => {
        if (res.action === "success") {
          this.setState({downloadURL: [region, level, selectedDates[mineType], res.url]});
        }
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => this.setState({fetching: false}));
  };

  render() {
    const {clipOption, fetching, downloadURL, mineType} = this.state;
    const {selectedRegion, selectedDates} = this.props;
    const {localeText: {download, validate}} = this.context;
    return (
      <ToolPanel title={download.title}>
        <label>{`${validate.typeLabel}:`}</label>
        <select
          onChange={e => this.setState({mineType: e.target.value})}
          style={{width: "100%"}}
          value={mineType}
        >
          {["pMines", "nMines", "cMines"].map(m =>
            <option key={m} value={m}>{validate[m]}</option>)}
        </select>
        <label>{download.regionLabel}</label>
        <div style={{marginTop: ".25rem"}}>
          <input
            checked={clipOption === 1}
            name="downloadRegion"
            onChange={() => this.setState({clipOption: 1})}
            type="radio"
          />
          <span>{download.allRadio}</span>
        </div>
        <div className={selectedRegion ? "" : "disabled-group"} style={{marginTop: ".25rem"}}>
          <input
            checked={clipOption === 2}
            name="downloadRegion"
            onChange={() => this.setState({clipOption: 2})}
            type="radio"
          />
          <span>{download.selectedRadio}</span>
        </div>
        {selectedDates && (
          <div style={{textAlign: "center", width: "100%", marginTop: ".5rem"}}>
            <Button
              disabled={fetching}
              onClick={this.getDownloadUrl}
            >
              {download.getUrl} {selectedDates[mineType]}
            </Button>
          </div>
        )}
        {fetching
          ? <p>{`${download.fetching}...`}</p>
          : downloadURL && (
            <p>
              <span>
                <a href={downloadURL[3]}>
                  {`${download.clickHere}`
                    + ` ${downloadURL[0] === "all" ? download.completeData : download.munData + downloadURL[0]} `
                    + `${download.prep} ${ downloadURL[2]}.`}
                </a>
              </span>
            </p>
          )}
      </ToolPanel>
    );
  }
}
DownloadPanel.contextType = MainContext;
