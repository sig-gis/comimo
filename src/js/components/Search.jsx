import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";

import Button from "./Button";
import SimpleSelect from "./Select";
import TextInput from "./TextInput";

import { THEME, URLS } from "../constants";
import { fitMap, selectedRegionAtom } from "../home/HomeMap";
import { jsonRequest } from "../utils";
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

const FormArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const FieldContainer = styled.div`
  padding-top: 1rem;
  margin-bottom: 1rem;

  // Style child label
  & > span {
    color: ${({ $isDisabled }) => ($isDisabled ? "var(--gray)" : "var(--black)")};
  }

  // Style autocomplete dropdown
  & .p-autocomplete {
    display: block;
    width: 100%;
  }

  // Style autocomplete input
  & .p-autocomplete > input {
    min-width: 80%;
  }

  // Style autocomplete dropdown button
  & .p-button {
    background: ${({ $isDisabled }) => ($isDisabled ? "var(--gray-3)" : "var(--orange-4)")};
    border-color: ${({ $isDisabled }) => ($isDisabled ? "var(--gray-4)" : "var(--orange-3)")};
    color: ${({ $isDisabled }) => ($isDisabled ? "var(--white)" : "var(--black)")};
  }
`;

const Label = styled.span`
  font-size: 16px;
  font-weight: var(--unnamed-font-weight-medium);
  letter-spacing: 0px;
  padding: 0 0.5rem;
  text-align: left; */
`;

export default function Search({ theMap, featureNames = {}, mapquestKey, isPanel }) {
  // State
  const { t } = useTranslation();
  const setSelectedRegion = useSetAtom(selectedRegionAtom);
  const visiblePanel = useAtomValue(visiblePanelAtom);
  const [geoCodedSearch, setGeoCodedSearch] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [latLngText, setLatLngText] = useState("");

  const [listOfStates, setListOfStates] = useState([]);
  const [selectedState, setSelectedState] = useState("default");

  const [listOfMunis, setListOfMunis] = useState([]);
  const [activeMunis, setActiveMunis] = useState({});
  const [selectedMuni, setSelectedMuni] = useState("default");
  const muniRef = useRef(null);

  useEffect(() => {
    setListOfStates(Object.keys(featureNames).sort());
  }, [featureNames]);

  useEffect(() => {
    const _activeMunis = featureNames[selectedState] || {};
    setActiveMunis(_activeMunis);
    setListOfMunis(Object.keys(_activeMunis).sort());
  }, [selectedState]);

  useEffect(() => {
    if (visiblePanel === "search-header") {
      setSelectedRegion(null);
      setSelectedState("default");
      setSelectedMuni("default");
      setSearchText("");
      setLatLngText("");
    }
  }, [visiblePanel]);

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
                setSelectedState(state);
                setSelectedMuni(mun);
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

  const muniSelectionDisabled = listOfMunis.length <= 0;

  return (
    <ThemeProvider theme={THEME}>
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

        <FormArea>
          {listOfStates.length > 0 ? (
            <>
              <FieldContainer>
                <Label>{t("search.defaultState")}</Label>
                <Select
                  id="state-dropdown"
                  classNamePrefix="select"
                  defaultValue={{ label: t("search.defaultState"), value: "default" }}
                  isSearchable={true}
                  options={listOfStates.map((s) => ({
                    label: s,
                    value: s,
                  }))}
                  onChange={({ value }) => {
                    setSelectedMuni("default");
                    setListOfMunis([]);
                    muniRef.current.setValue({
                      label: t("search.defaultMun"),
                      value: "default",
                    });
                    setSelectedRegion(null);
                    setSelectedState(value);
                  }}
                />
              </FieldContainer>

              <FieldContainer $isDisabled={muniSelectionDisabled}>
                <Label>{t("search.defaultMun")}</Label>
                <Select
                  ref={muniRef}
                  id="municipality-dropdown"
                  classNamePrefix="select"
                  defaultValue={{ label: t("search.defaultMun"), value: "default" }}
                  isDisabled={muniSelectionDisabled}
                  isSearchable={true}
                  options={listOfMunis.map((muni) => ({
                    label: muni,
                    value: muni,
                  }))}
                  onChange={({ value: _muni }) => {
                    const coords = activeMunis[_muni];
                    setSelectedMuni(_muni);
                    if (Array.isArray(coords)) fitMap(theMap, "bbox", coords, t);
                    // We don't want to set the selected region on the header Search tool
                    !isPanel && setSelectedRegion("mun_" + selectedState + "_" + _muni);
                  }}
                />
              </FieldContainer>
            </>
          ) : (
            t("search.loading") + "..."
          )}
        </FormArea>
      </div>
    </ThemeProvider>
  );
}
