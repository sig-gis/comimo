import React from "react";
import styled from "@emotion/styled";

import Button from "../components/Button";
import Search from "../components/Search";
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
    const { featureNames, fitMap, mapquestKey, selectedDates, selectedRegion, selectRegion } =
      this.props;
    const {
      localeText: { download, validate },
    } = this.context;
    const Title = styled.h2`
      border-bottom: 1px solid gray;
      font-weight: bold;
      padding: 0.5rem;
    `;
    return (
      <ToolPanel title={download.title}>
        {this.state.showModal && <LoadingModal message="Getting URL" />}

        <div style={{ display: "flex", flexDirection: "column" }}>
          <label>{`${validate.typeLabel}:`}</label>
          <Select
            id="selectMineType"
            onChange={(e) => this.setState({ mineType: e.target.value })}
            options={["pMines", "nMines", "cMines"].map((k) => ({ value: k, label: validate[k] }))}
            value={mineType}
          />
          <div style={{ marginTop: ".25rem" }}>
            <input
              checked={clipOption === 1}
              name="downloadRegion"
              onChange={() => this.setState({ clipOption: 1 })}
              type="radio"
            />
            <span>{download.allRadio}</span>
          </div>
          {/* TODO: disabled-group is not defined yet */}
          <div className={selectedRegion ? "" : "disabled-group"} style={{ marginTop: ".25rem" }}>
            <input
              checked={clipOption === 2}
              name="downloadRegion"
              onChange={() => this.setState({ clipOption: 2 })}
              type="radio"
            />
            <span>{download.selectedRadio}</span>
          </div>
          <div>
            <Title>{download.selectMuni}</Title>
            <Search
              featureNames={featureNames}
              fitMap={fitMap}
              mapquestKey={mapquestKey}
              selectRegion={selectRegion}
            ></Search>
          </div>
          {selectedDates && (
            <Button
              buttonText={`${download.getUrl} ${selectedDates[mineType]}`}
              clickHandler={this.getDownloadUrl}
              extraStyle={{ marginTop: "0.25rem" }}
              isDisabled={fetching}
            />
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
