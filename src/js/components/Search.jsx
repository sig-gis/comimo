import React from "react";
import styled from "@emotion/styled";

import Button from "./Button";
import Select from "./Select";
import TextInput from "./TextInput";

import { jsonRequest } from "../utils";
import { MainContext } from "./PageLayout";
import { URLS } from "../constants";

const searchResults = styled.div`
  &:active {
    background: #ddd;
    cursor: pointer;
  }

  &:hover {
    background: #eee;
    cursor: pointer;
  }
`;
export default class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      geoCodedSearch: null,
      selectedL1: -1,
      selectedL2: -1,
      searchText: "",
      latLngText: "",
    };
  }

  searchGeocode = () => {
    const { searchText } = this.state;
    const { featureNames, mapquestKey } = this.props;
    const url =
      URLS.MAPQUEST + "?key=" + mapquestKey + "&county=" + searchText + "&country=colombia";
    jsonRequest(url, null, "GET")
      .then((result) => {
        this.setState({
          geoCodedSearch: result.results[0].locations.filter((l) => {
            try {
              return (
                l.adminArea1 === "CO" &&
                featureNames[l.adminArea3.toUpperCase()][l.adminArea4.toUpperCase()] &&
                !l.adminArea5 &&
                !l.adminArea6
              );
            } catch (err) {
              return false;
            }
          }),
        });
      })
      .catch((error) => console.error(error));
  };

  processLatLng = () => {
    const { latLngText } = this.state;
    const { fitMap } = this.props;
    const pair = latLngText.split(",");
    const nump = pair.map((a) => parseFloat(a)).slice(0, 2);
    fitMap("point", [nump[1], nump[0]]);
  };

  render() {
    const { geoCodedSearch, selectedL1, selectedL2, searchText, latLngText } = this.state;
    const { featureNames, fitMap, selectRegion } = this.props;
    const {
      localeText: { search },
    } = this.context;

    const geoSearchResults =
      geoCodedSearch && geoCodedSearch.length === 0 ? (
        <div style={{ marginLeft: "0.25rem" }}>{search?.noResults}</div>
      ) : (
        geoCodedSearch && (
          <div>
            {geoCodedSearch.slice(0, 3).map((item) => (
              <searchResults
                key={item.adminArea3}
                onClick={() => {
                  const state = item.adminArea3.toUpperCase();
                  const mun = item.adminArea4.toUpperCase();
                  this.setState({ selectedL1: state, selectedL2: mun });
                  fitMap("bbox", featureNames[state][mun]);
                  selectRegion(
                    "mun_" + item.adminArea3.toUpperCase() + "_" + item.adminArea4.toUpperCase()
                  );
                }}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <span>
                  <b>{item.adminArea1}</b>&nbsp;
                  <i>
                    {item.adminArea4}, {item.adminArea3}
                  </i>
                </span>
                <span>
                  {item.latLng.lat},{item.latLng.lng}
                </span>
              </searchResults>
            ))}
          </div>
        )
      );

    const l1Names = Object.keys(featureNames).sort() || [];
    const selectL1 =
      l1Names.length > 0 ? (
        <Select
          defaultOption={search?.defaultState}
          id="selectL1"
          label={search.stateLabel}
          onChange={(e) => this.setState({ selectedL1: e.target.value, selectedL2: -1 })}
          options={l1Names}
          value={selectedL1}
        />
      ) : (
        search?.loading + "..."
      );

    const activeMuns = featureNames[selectedL1] || {};
    const l2names = Object.keys(activeMuns).sort();
    const selectL2 =
      l2names.length > 0 ? (
        <Select
          defaultOption={search?.defaultMun}
          id="selectL2"
          label={search?.munLabel}
          onChange={(e) => {
            const l2Name = e.target.value;
            const coords = activeMuns[l2Name];
            this.setState({ selectedL2: l2Name });
            if (Array.isArray(coords)) fitMap("bbox", coords);
            selectRegion("mun_" + selectedL1 + "_" + l2Name);
          }}
          options={l2names}
          value={selectedL2}
        />
      ) : (
        ""
      );

    return (
      <div>
        <TextInput
          id="inputGeocode"
          label={search?.internetLabel}
          onChange={(e) => this.setState({ searchText: e.target.value })}
          onKeyUp={(e) => {
            if (e.key === "Enter") this.searchGeocode();
          }}
          render={() => (
            <Button onClick={this.searchGeocode} extraStyle={{ marginLeft: "0.25rem" }}>
              {search?.goButton}
            </Button>
          )}
          value={searchText}
        />
        {geoSearchResults}
        <TextInput
          id="inputLatLng"
          label={search?.coordLabel}
          onChange={(e) => this.setState({ latLngText: e.target.value })}
          onKeyUp={(e) => {
            if (e.key === "Enter") this.processLatLng();
          }}
          render={() => (
            <Button onClick={this.processLatLng} extraStyle={{ marginLeft: "0.25rem" }}>
              {search?.goButton}
            </Button>
          )}
          value={latLngText}
        />
        <label>{search?.selectLabel}</label>
        {selectL1}
        {selectL2}
      </div>
    );
  }
}
Search.contextType = MainContext;
