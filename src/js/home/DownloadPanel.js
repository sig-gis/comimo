import React from "react";

import Button from "../components/Button";
import Select from "../components/Select";
import ToolPanel from "../components/ToolPanel";

import LoadingModal from "../components/LoadingModal";
import { MainContext } from "../components/PageLayout";
import { URLS } from "../constants";
import { jsonRequest } from "../utils";

export default class DownloadPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      clipOption: 1,
      downloadURL: false,
      fetching: false,
      mineType: "cMines",
      showModal: false,
    };
  }

  processModal = (callBack) =>
    new Promise(() =>
      Promise.resolve(
        this.setState({ showModal: true }, () =>
          callBack().finally(() => this.setState({ showModal: false }))
        )
      )
    );

  getDownloadUrl = () => {
    const { selectedRegion, selectedDates } = this.props;
    const { clipOption, mineType } = this.state;

    const region = clipOption === 1 ? "all" : selectedRegion;
    this.processModal(() =>
      jsonRequest(URLS.GET_DL_URL, { region, dataLayer: selectedDates[mineType] })
        .then((resp) => {
          this.setState({ downloadURL: [region, selectedDates[mineType], resp] });
        })
        .catch((err) => {
          console.error(err);
        })
    );
  };

  render() {
    const { clipOption, fetching, downloadURL, mineType } = this.state;
    const { selectedRegion, selectedDates } = this.props;
    const {
      localeText: { download, validate },
    } = this.context;
    return (
      <ToolPanel title={download.title}>
        {this.state.showModal && <LoadingModal message="Getting URL" />}
        <div className="flex flex-col">
          <label>{`${validate.typeLabel}:`}</label>
          <Select
            id="selectMineType"
            onChange={(e) => this.setState({ mineType: e.target.value })}
            options={["pMines", "nMines", "cMines"].map((k) => ({ value: k, label: validate[k] }))}
            value={mineType}
          />
          <label>{download.regionLabel}</label>
          <div style={{ marginTop: ".25rem" }}>
            <input
              checked={clipOption === 1}
              name="downloadRegion"
              onChange={() => this.setState({ clipOption: 1 })}
              type="radio"
            />
            <span>{download.allRadio}</span>
          </div>
          <div className={selectedRegion ? "" : "disabled-group"} style={{ marginTop: ".25rem" }}>
            <input
              checked={clipOption === 2}
              name="downloadRegion"
              onChange={() => this.setState({ clipOption: 2 })}
              type="radio"
            />
            <span>{download.selectedRadio}</span>
          </div>
          {selectedDates && (
            <Button className="mt-4" disabled={fetching} onClick={this.getDownloadUrl}>
              {download.getUrl} {selectedDates[mineType]}
            </Button>
          )}
          {fetching ? (
            <p>{`${download.fetching}...`}</p>
          ) : (
            downloadURL && (
              <p>
                <span>
                  <a href={downloadURL[2]}>
                    {`${download.clickHere}` +
                      ` ${
                        downloadURL[0] === "all"
                          ? download.completeData
                          : download.munData + downloadURL[0]
                      }` +
                      ` ${download.prep}` +
                      ` ${downloadURL[1]}.`}
                  </a>
                </span>
              </p>
            )
          )}
        </div>
      </ToolPanel>
    );
  }
}
DownloadPanel.contextType = MainContext;
