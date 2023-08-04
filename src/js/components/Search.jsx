import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { AutoComplete } from "primereact/autocomplete";
import { ThemeProvider } from "@emotion/react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";

import Button from "./Button";
import Select from "./Select";
import TextInput from "./TextInput";

import { THEME, URLS } from "../constants";
import { fitMap, selectedRegionAtom } from "../home/HomeMap";
import { jsonRequest } from "../utils";
import { visiblePanelAtom } from "../home";

import "primereact/resources/themes/rhea/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
// import "./Search.css";

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
  padding-top: 2rem;
  margin-bottom: 2rem;
`;

const Label = styled.span`
  color: ${({ $isDisabled }) => ($isDisabled ? "var(--gray)" : "var(--black)")};
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
  const [listOfStateSuggestions, setListOfStateSuggestions] = useState(null);
  const [selectedState, setSelectedState] = useState();

  const [listOfMunis, setListOfMunis] = useState([]);
  const [listOfMuniSuggestions, setListOfMuniSuggestions] = useState(null);
  const [selectedMuni, setSelectedMuni] = useState();

  useEffect(() => {
    setListOfStates(Object.keys(featureNames).sort());
  }, [featureNames]);

  useEffect(() => {
    setListOfMunis(Object.keys(featureNames[selectedState] || {}).sort());
  }, [selectedState]);

  useEffect(() => {
    if (visiblePanel === "search-header") {
      setSelectedRegion(null);
      setSelectedState("");
      setSelectedMuni("");
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

  const filterListOfStates = (event) => {
    if (!event.query.trim().length) {
      setListOfStateSuggestions(listOfStates);
    } else {
      const _filteredList = listOfStates.filter((stateString) => {
        return stateString.toLowerCase().startsWith(event.query.toLowerCase());
      });
      setListOfStateSuggestions(_filteredList);
    }
  };

  const filterListOfMunis = (event) => {
    if (!event.query.trim().length) {
      setListOfMuniSuggestions(listOfMunis);
    } else {
      const _filteredList = listOfMunis.filter((muniString) => {
        return muniString.toLowerCase().startsWith(event.query.toLowerCase());
      });
      setListOfMuniSuggestions(_filteredList);
    }
  };

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
        {listOfStates.length > 0 ? (
          <FormArea>
            <FieldContainer>
              <Label>{t("search.defaultState")}</Label>
              <AutoComplete
                aria-label={t("search.stateLabel")}
                dropdownAriaLabel={t("search.defaultState")}
                value={selectedState}
                suggestions={listOfStateSuggestions}
                onChange={(e) => setSelectedState(e.target.value)}
                completeMethod={filterListOfStates}
                dropdown
              />
            </FieldContainer>
            <FieldContainer>
              <Label $isDisabled={listOfMunis.length <= 0}>{t("search.defaultMun")}</Label>
              <AutoComplete
                aria-label={t("search.munLabel")}
                dropdownAriaLabel={t("search.defaultMun")}
                value={selectedMuni}
                disabled={listOfMunis.length <= 0}
                suggestions={listOfMuniSuggestions}
                onChange={(e) => setSelectedMuni(e.target.value)}
                onSelect={(e) => {
                  const _selectedMuni = e.value;
                  setSelectedMuni(_selectedMuni);
                  const coords = featureNames[selectedState][_selectedMuni];
                  if (Array.isArray(coords)) {
                    fitMap(theMap, "bbox", coords, t);
                  }
                  // We don't want to set the selected region on the header Search tool
                  !isPanel && setSelectedRegion("mun_" + selectedState + "_" + selectedMuni);
                }}
                completeMethod={filterListOfMunis}
                dropdown
              />
            </FieldContainer>
          </FormArea>
        ) : (
          t("search.loading") + "..."
        )}
      </div>
    </ThemeProvider>
  );
}
