import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import Button from "./Button";
import Select from "./Select";
import TextInput from "./TextInput";

import { jsonRequest } from "../utils";
import { URLS } from "../constants";
import { fitMap, selectedRegionAtom } from "../home/HomeMap";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { visiblePanelAtom } from "../home";

const SearchResults = styled.div`
  background: var(--gray-3);
  border-radius: 5px;
  padding: 0.5rem;

  &:active {
    background: var(--orange-4);
    cursor: pointer;
  }

  &:hover {
    background: var(--orange-4);
    cursor: pointer;
  }

  &:last-child {
    margin-bottom: 15px;
  }
`;

export default function Search({ theMap, featureNames, mapquestKey, isPanel }) {
  // State

  const setSelectedRegion = useSetAtom(selectedRegionAtom);
  const visiblePanel = useAtomValue(visiblePanelAtom);

  useEffect(() => {
    if (visiblePanel === "search-header") {
      setSelectedRegion(null);
      setSelectedL1(-1);
      setSelectedL2(-1);
      setSearchText("");
      setLatLngText("");
    }
  }, [visiblePanel]);

  const [geoCodedSearch, setGeoCodedSearch] = useState(null);
  const [selectedL1, setSelectedL1] = useState(-1);
  const [selectedL2, setSelectedL2] = useState(-1);
  const [searchText, setSearchText] = useState("");
  const [latLngText, setLatLngText] = useState("");

  const { t } = useTranslation();

  const searchGeocode = () => {
    const url = URLS.MAPQUEST + "?key=" + mapquestKey + "&location=" + searchText + ",Columbia";
    jsonRequest(url, null, "GET")
      .then((result) => {
        setGeoCodedSearch(
          result.results[0].locations.filter((l) => {
            try {
              return (
                l.adminArea1 === "CO" &&
                featureNames[l.adminArea4.toUpperCase()][l.adminArea5.toUpperCase()] &&
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
    fitMap(theMap, "point", [lng, lat], t);
  };

  // Helper render functions

  const geoSearchResults =
    geoCodedSearch && geoCodedSearch.length === 0 ? (
      <div style={{ marginLeft: "0.25rem" }}>{t("search.noResults")}</div>
    ) : (
      geoCodedSearch && (
        <div>
          {geoCodedSearch.slice(0, 3).map((item) => (
            <SearchResults
              key={item.adminArea3}
              onClick={() => {
                const state = item.adminArea4.toUpperCase();
                const mun = item.adminArea5.toUpperCase();
                setSelectedL1(state);
                setSelectedL2(mun);
                fitMap(theMap, "bbox", featureNames[state][mun], t);
                // We don't want to set the selected region on the header Search tool
                !isPanel &&
                  setSelectedRegion(
                    // adminArea4 is "county", adminArea5 is "city"
                    `mun_${item.adminArea5.toUpperCase()}_${item.adminArea4.toUpperCase()}`
                  );
              }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span>
                <b>{item.adminArea1}</b>&nbsp;
                <i>
                  {item.adminArea5}, {item.adminArea4}
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
        defaultOption={t("search.defaultState")}
        id="selectL1"
        label={t("search.stateLabel")}
        onChange={(e) => {
          setSelectedL1(e.target.value);
          setSelectedL2(-1);
        }}
        options={l1Names}
        value={selectedL1}
      />
    ) : (
      t("search.loading") + "..."
    );

  const activeMuns = featureNames[selectedL1] || {};

  const l2names = Object.keys(activeMuns).sort();

  const selectL2 =
    l2names.length > 0 ? (
      <Select
        defaultOption={t("search.defaultMun")}
        id="selectL2"
        label={t("search.munLabel")}
        onChange={(e) => {
          const l2Name = e.target.value;
          const coords = activeMuns[l2Name];
          setSelectedL2(l2Name);
          if (Array.isArray(coords)) fitMap(theMap, "bbox", coords, t);
          // We don't want to set the selected region on the header Search tool
          !isPanel && setSelectedRegion("mun_" + selectedL1 + "_" + l2Name);
        }}
        options={l2names}
        value={selectedL2}
      />
    ) : (
      <Select
        defaultOption={t("search.defaultMun")}
        disabled={true}
        id="selectL2"
        label={t("search.munLabel")}
        options={[t("search.defaultMun")]}
        value={t("search.defaultMun")}
      />
    );

  // Render
  return (
    <div>
      {isPanel && (
        <>
          <TextInput
            id="inputGeocode"
            label={t("search.internetLabel")}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") searchGeocode();
            }}
            render={() => (
              <Button onClick={searchGeocode} extraStyle={{ marginLeft: "0.25rem" }}>
                {t("search.goButton")}
              </Button>
            )}
            value={searchText}
          />
          {geoSearchResults}
          <TextInput
            id="inputLatLng"
            label={t("search.coordLabel")}
            onChange={(e) => setLatLngText(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") processLatLng();
            }}
            render={() => (
              <Button onClick={processLatLng} extraStyle={{ marginLeft: "0.25rem" }}>
                {t("search.goButton")}
              </Button>
            )}
            value={latLngText}
          />
        </>
      )}
      {selectL1}
      {selectL2}
    </div>
  );
}
