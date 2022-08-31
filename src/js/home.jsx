import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { atom } from "jotai";
import mapboxgl from "mapbox-gl";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useAtom } from "jotai";
import DownloadPanel from "./home/DownloadPanel";
import FilterPanel from "./home/FilterPanel";
import HomeMap, { homeMapAtom, mapPopupAtom } from "./home/HomeMap";
// import InfoPopupContent from "./home/InfoPopupContent";
import FooterBar from "./components/FooterBar";
import IconTextButton from "./components/IconTextButton";
import IconButton from "./components/IconButton";
import MenuItem from "./components/MenuItem";
import { MainContext, PageLayout } from "./components/PageLayout";
import SideBar from "./components/SideBar";
import LayersPanel from "./home/LayersPanel";
import ReportMinesPanel from "./home/ReportMinesPanel";
import ReportPopupContent from "./home/ReportPopupContent";
import StatsPanel from "./home/StatsPanel";
import SubscribePanel from "./home/SubscribePanel";
import ValidatePanel from "./home/ValidatePanel";

import { availableLayers, URLS } from "./constants";
import { jsonRequest } from "./utils";

export const selectedDatesAtom = atom({});

export const updateStateMap = (setter, prevVal, newVal) => setter({ ...prevVal, ...newVal });

const Buttons = styled.div`
  display: flex;
  flex: 3;
  justify-content: space-around;
`;

const Logo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: space-around;
  padding: 5px 0;
`;

const LogoImg = styled.img`
  cursor: pointer;
  height: 22px;
  padding-right: 15px;
  width: 67px;
`;

const LogoGitVersion = styled.a`
  color: var(--white);
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0px;
  text-align: left;
  text-decoration: none;
`;

const Hidable = styled.div`
  display: ${({ active }) => !active && "none"};
`;

const BarItem = styled.div`
  // display: flex;
  // flex-direction: column;
`;

export const visiblePanelAtom = atom(null);
export const showModalAtom = atom(null);
export const extraMapParamsAtom = atom({
  NICFI: {
    dataLayer: null,
    band: "rgb",
  },
});

export const processModal = (callBack, setShowModal) =>
  new Promise(() => {
    setShowModal(true);
    callBack().finally(() => setShowModal(false));
  });

function HomeContents({ mapquestKey, mapboxToken, version }) {
  // Initial state
  const [visiblePanel, setVisiblePanel] = useAtom(visiblePanelAtom);
  const [imageDates, setImageDates] = useState({});
  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [featureNames, setFeatureNames] = useState({});
  const [subscribedList, setSubscribedList] = useState([]);
  const [homeMapPoupup, setHomeMapPoupup] = useAtom(mapPopupAtom);
  const [homeMap, setHomeMap] = useAtom(homeMapAtom);
  const [extraMapParams, setExtraMapParams] = useAtom(extraMapParamsAtom);
  const [nicfiLayers, setNicfiLayers] = useState([]);

  const {
    localeText,
    localeText: { home },
    username,
    setShowInfo,
  } = useContext(MainContext);

  // Effects

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.keyCode === 27) {
        // if (homeMapPoupup) homeMapPoupup.remove();
        // setHomeMapPoupup(null);
        setVisiblePanel(null);
      }
    };
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    const getImageDates = async () => {
      const result = await jsonRequest(URLS.IMG_DATES);
      const initialDates = Object.keys(result).reduce(
        (acc, cur) => ({ ...acc, [cur]: result[cur][0] }),
        {}
      );

      setImageDates(result);
      setSelectedDates(initialDates);
    };

    getImageDates().catch(console.error);
  }, []);

  const togglePanel = (panelKey) => {
    setVisiblePanel(panelKey === visiblePanel ? null : panelKey);
  };

  const selectDates = (newDates) => setSelectedDates({ ...selectedDates, ...newDates });

  const setParams = (param, value) => {
    setExtraMapParams({
      ...extraMapParams,
      [param]: value,
    });
  };

  useEffect(() => {
    const getNICFIDates = async () => {
      const dates = await jsonRequest(URLS.NICFI_DATES);
      setNicfiLayers(dates);
      setParams("NICFI", { ...extraMapParams.NICFI, dataLayer: dates[0] });
    };

    getNICFIDates().catch(console.error);
  }, [selectedDates]);

  useEffect(() => {
    const getFeatureNames = async () => {
      const features = await jsonRequest(URLS.FEATURE_NAMES);
      setFeatureNames(features);
    };

    getFeatureNames().catch(console.error);
  }, []);

  return (
    <>
      <HomeMap mapboxToken={mapboxToken} />
      <div id="bottom-bar">
        <FooterBar>
          <Buttons>
            {/* Layers */}
            <BarItem>
              <IconTextButton
                active={visiblePanel === "layers"}
                hasBackground={true}
                icon="layer"
                onClick={() => togglePanel("layers")}
                text="Layers"
              />
              <LayersPanel active={visiblePanel === "layers"} nicfiLayers={nicfiLayers} />
            </BarItem>

            {/* Subscribe */}
            <BarItem>
              <IconTextButton
                active={visiblePanel === "subscribe"}
                hasBackground={true}
                icon="envelope"
                onClick={() => togglePanel("subscribe")}
                text="Subscribe"
              />
              <SubscribePanel
                active={visiblePanel === "subscribe"}
                featureNames={featureNames}
                // map={homeMap.current}
                mapquestKey={mapquestKey}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                subscribedList={subscribedList}
                setSubscribedList={setSubscribedList}
              />
            </BarItem>

            {/* Validation */}
            <BarItem>
              <IconTextButton
                active={visiblePanel === "validate"}
                hasBackground={true}
                icon="check"
                onClick={() => togglePanel("validate")}
                text="Validations"
              />
              <ValidatePanel
                active={visiblePanel === "validate"}
                featureNames={featureNames}
                selectedDates={selectedDates}
                subscribedList={subscribedList}
              />
            </BarItem>

            {/* Filter */}
            <BarItem>
              <IconTextButton
                active={visiblePanel === "filter"}
                hasBackground={true}
                icon="filter"
                onClick={() => togglePanel("filter")}
                text="Filter"
              />
              <FilterPanel
                active={visiblePanel === "filter"}
                imageDates={imageDates}
                selectDates={selectDates}
                selectedDates={selectedDates}
              />
            </BarItem>

            {/* Report Mines */}
            <BarItem>
              <IconTextButton
                active={visiblePanel === "report"}
                hasBackground={true}
                icon="mine"
                onClick={() => togglePanel("report")}
                text="Report Mines"
              />
              <ReportMinesPanel
                active={visiblePanel === "report"}
                iamgeDates={imageDates}
                selectDates={selectDates}
                selectedDates={selectedDates}
              />
            </BarItem>

            {/* Download Data */}
            <BarItem>
              <IconTextButton
                active={visiblePanel === "download"}
                hasBackground={true}
                icon="download"
                onClick={() => togglePanel("download")}
                text="Download"
              />
              <DownloadPanel
                active={visiblePanel === "download"}
                featureNames={featureNames}
                // map={homeMap.current}
                mapquestKey={mapquestKey}
                selectedDates={selectedDates}
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
              />
            </BarItem>

            {/* Statistics */}
            <BarItem>
              <IconTextButton
                active={visiblePanel === "stats"}
                hasBackground={true}
                icon="stats"
                onClick={() => togglePanel("stats")}
                text="Statistics"
              />
              <StatsPanel
                active={visiblePanel === "stats"}
                selectedDate={selectedDates?.cMines}
                subscribedList={subscribedList}
              />
            </BarItem>

            {/* <MenuItem
          icon="envelope"
          itemName="subscribe"
          onClick={togglePanel}
          selectedItem={visiblePanel}
          tooltip={localeText.home.subscribeTooltip}
        >
          <SubscribePanel
            featureNames={this.state.featureNames}
            fitMap={this.fitMap}
            mapquestKey={this.props.mapquestKey}
            selectedRegion={this.state.selectedRegion}
            selectRegion={this.selectRegion}
            subscribedList={this.state.subscribedList}
            updateSubList={this.updateSubList}
          />
        </MenuItem> */}
          </Buttons>
          <Logo>
            {/* TODO: move this top bar (menu admin) */}
            {/* {true && (
              <IconButton
                extraStyle={{ marginRight: "10px" }}
                icon="admin"
                onClick={() => window.location.assign("/admin")}
                // tooltip={localeText.home?.admin}
              />
            )} */}
            <IconButton
              // extraStyle={{ marginRight: "10px" }}
              icon="info"
              onClick={() => setShowInfo(true)}
            />
            <LogoImg
              alt="app-logo"
              onClick={() => window.location.assign("/")}
              src="/img/app-logo.png"
            />
            <LogoGitVersion
              href={`https://github.com/sig-gis/comimo/tags/${version}`}
              target="/blank"
            >
              {version && `Version: ${version}`}
            </LogoGitVersion>
          </Logo>
        </FooterBar>
      </div>
    </>
  );
}

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
      version={args.version}
    >
      <HomeContents
        mapboxToken={args.mapboxToken}
        mapquestKey={args.mapquestKey}
        version={args.version}
      />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
