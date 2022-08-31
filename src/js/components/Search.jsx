import React, { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";

import Button from "./Button";
import Select from "./Select";
import TextInput from "./TextInput";

import { jsonRequest } from "../utils";
import { MainContext } from "./PageLayout";
import { URLS } from "../constants";
import { fitMap } from "../home/HomeMap";

const SearchResults = styled.div`
  &:active {
    background: #ddd;
    cursor: pointer;
  }

  &:hover {
    background: #eee;
    cursor: pointer;
  }
`;

export default function Search({ featureNames, map, mapquestKey, selectRegion }) {
  // State

  const [geoCodedSearch, setGeoCodedSearch] = useState(null);
  const [selectedL1, setSelectedL1] = useState(-1);
  const [selectedL2, setSelectedL2] = useState(-1);
  const [searchText, setSearchText] = useState("");
  const [latLngText, setLatLngText] = useState("");

  const {
    localeText: { search, home },
  } = useContext(MainContext);

  // Helper search functions

  const searchGeocode = () => {
    const url =
      URLS.MAPQUEST + "?key=" + mapquestKey + "&county=" + searchText + "&country=colombia";
    jsonRequest(url, null, "GET")
      .then((result) => {
        setGeoCodedSearch(
          result.results[0].locations.filter((l) => {
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
          })
        );
      })
      .catch((error) => console.error(error));
  };

  const processLatLng = () => {
    const pair = latLngText.split(",");
    const [lat, lng] = pair.map((a) => parseFloat(a)).slice(0, 2);
    fitMap(map, "point", [lng, lat], home);
  };

  // Helper render functions

  const geoSearchResults =
    geoCodedSearch && geoCodedSearch.length === 0 ? (
      <div style={{ marginLeft: "0.25rem" }}>{search?.noResults}</div>
    ) : (
      geoCodedSearch && (
        <div>
          {geoCodedSearch.slice(0, 3).map((item) => (
            <SearchResults
              key={item.adminArea3}
              onClick={() => {
                const state = item.adminArea3.toUpperCase();
                const mun = item.adminArea4.toUpperCase();
                setSelectedL1(state);
                setSelectedL2(mun);
                fitMap(map, "bbox", featureNames[state][mun], home);
                setSelectedRegion(
                  `mun_${item.adminArea3.toUpperCase()}_${item.adminArea4.toUpperCase()}`
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
            </SearchResults>
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
        label={search?.stateLabel}
        onChange={(e) => {
          setSelectedL1(e.target.value);
          setSelectedL2(-1);
        }}
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
          setSelectedL2(l2Name);
          if (Array.isArray(coords)) fitMap(map, "bbox", coords, home);
          setSelectedRegion("mun_" + selectedL1 + "_" + l2Name);
        }}
        options={l2names}
        value={selectedL2}
      />
    ) : (
      ""
    );

  // Render
  return (
    <div>
      <TextInput
        id="inputGeocode"
        label={search?.internetLabel}
        onChange={(e) => setSearchText(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") searchGeocode();
        }}
        render={() => (
          <Button onClick={searchGeocode} extraStyle={{ marginLeft: "0.25rem" }}>
            {search?.goButton}
          </Button>
        )}
        value={searchText}
      />
      {geoSearchResults}
      <TextInput
        id="inputLatLng"
        label={search?.coordLabel}
        onChange={(e) => setLatLngText(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") processLatLng();
        }}
        render={() => (
          <Button onClick={processLatLng} extraStyle={{ marginLeft: "0.25rem" }}>
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
