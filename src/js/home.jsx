import React, { useEffect, useState, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { useAtom, useSetAtom, useAtomValue, atom } from "jotai";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

import DownloadPanel from "./home/DownloadPanel";
import FilterPanel from "./home/FilterPanel";
import FooterBar from "./components/FooterBar";
import IconTextButton from "./components/IconTextButton";
import IconButton from "./components/IconButton";
import {
  PageLayout,
  mapquestKeyAtom,
  showInfoAtom,
  versionDeployedAtom,
  usernameAtom,
} from "./components/PageLayout";
import LayersPanel from "./home/LayersPanel";
import ReportMinesPanel from "./home/ReportMinesPanel";
import StatsPanel from "./home/StatsPanel";
import SubscribePanel from "./home/SubscribePanel";
import ValidatePanel from "./home/ValidatePanel";

import HomeMap, { homeMapAtom, mapPopupAtom, selectedLatLngAtom } from "./home/HomeMap";
import { URLS } from "./constants";
import { jsonRequest } from "./utils";

export const selectedDatesAtom = atom({});
export const updateStateMap = (setter, prevVal, newVal) => setter({ ...prevVal, ...newVal });
export const visiblePanelAtom = atom(null);
export const showModalAtom = atom(null);
export const extraMapParamsAtom = atom({
  NICFI: {
    dataLayer: null,
    band: "rgb",
  },
});
export const featureNamesAtom = atom({});

export const processModal = (callBack, setShowModal) => {
  new Promise(() => {
    setShowModal(true);
    callBack().finally(() => setShowModal(false));
  });
};

function HomeContents() {
  const homeMap = useAtomValue(homeMapAtom);
  const [visiblePanel, setVisiblePanel] = useAtom(visiblePanelAtom);
  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom);
  const [homeMapPoupup, setHomeMapPoupup] = useAtom(mapPopupAtom);
  const [extraMapParams, setExtraMapParams] = useAtom(extraMapParamsAtom);
  const [featureNames, setFeatureNames] = useAtom(featureNamesAtom);
  const username = useAtomValue(usernameAtom);
  const setShowInfo = useSetAtom(showInfoAtom);
  const mapquestKey = useAtomValue(mapquestKeyAtom);
  const versionDeployed = useAtomValue(versionDeployedAtom);
  const [subscribedList, setSubscribedList] = useState([]);
  const [imageDates, setImageDates] = useState({});
  const [nicfiLayers, setNicfiLayers] = useState([]);
  const [selectedLatLng, setSelectedLatLng] = useAtom(selectedLatLngAtom);

  const { t } = useTranslation();

  // Effects

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.keyCode === 27) {
        if (homeMapPoupup) {
          homeMapPoupup.remove();
          setHomeMapPoupup(null);
        }
        setVisiblePanel(null);
        setSelectedLatLng(null);
        setShowInfo(null);
      }
    };
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [homeMapPoupup, visiblePanel]);

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
      <HomeMap />
      <FooterBar>
        <Buttons>
          {/* Layers */}
          <BarItem>
            <IconTextButton
              active={visiblePanel === "layers"}
              hasBackground={true}
              icon="layer"
              onClick={() => togglePanel("layers")}
              text={t("home.layersTitle")}
            />
            <LayersPanel
              active={visiblePanel === "layers"}
              nicfiLayers={nicfiLayers}
              nicfiOnly={false}
              theMap={homeMap}
            />
          </BarItem>

          {/* Subscribe */}
          <BarItem>
            <IconTextButton
              active={visiblePanel === "subscribe"}
              hasBackground={true}
              icon="envelope"
              onClick={() => togglePanel("subscribe")}
              text={t("home.subscribeTitle")}
            />
            <SubscribePanel
              active={visiblePanel === "subscribe"}
              featureNames={featureNames}
              mapquestKey={mapquestKey}
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
              text={t("home.validationsTitle")}
            />
            <ValidatePanel
              active={visiblePanel === "validate"}
              featureNames={featureNames}
              selectedDates={selectedDates}
              subscribedList={subscribedList}
            />
          </BarItem>
          {/* "Advanced Controls" */}
          {username && (
            <>
              {/* Filter */}
              <BarItem>
                <IconTextButton
                  active={visiblePanel === "filter"}
                  hasBackground={true}
                  icon="filter"
                  onClick={() => togglePanel("filter")}
                  text={t("home.filterTitle")}
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
                  text={t("home.reportMinesTitle")}
                />
                <ReportMinesPanel active={visiblePanel === "report"} />
              </BarItem>

              {/* Download Data */}
              <BarItem>
                <IconTextButton
                  active={visiblePanel === "download"}
                  hasBackground={true}
                  icon="download"
                  onClick={() => togglePanel("download")}
                  text={t("home.downloadTitle")}
                />
                <DownloadPanel
                  active={visiblePanel === "download"}
                  featureNames={featureNames}
                  mapquestKey={mapquestKey}
                  selectedDates={selectedDates}
                />
              </BarItem>

              {/* Statistics */}
              <BarItem>
                <IconTextButton
                  active={visiblePanel === "stats"}
                  hasBackground={true}
                  icon="stats"
                  onClick={() => togglePanel("stats")}
                  text={t("home.statisticsTitle")}
                />
                <StatsPanel
                  active={visiblePanel === "stats"}
                  selectedDate={selectedDates.cMines}
                  subscribedList={subscribedList}
                />
              </BarItem>
            </>
          )}
        </Buttons>
        <Logo>
          <IconButton
            icon="info"
            onClick={() => setShowInfo(true)}
            tooltip={t("home.appInfoTooltip")}
          />
          <LogoGitVersion
            href={
              versionDeployed
                ? `https://github.com/sig-gis/comimo/releases/tag/${versionDeployed}`
                : "https://github.com/sig-gis/comimo"
            }
            target="/blank"
          >
            {versionDeployed ? `Version: ${versionDeployed}` : "Version: Latest"}
          </LogoGitVersion>
        </Logo>
      </FooterBar>
    </>
  );
}

export function pageInit(args) {
  const root = createRoot(document.getElementById("app"));
  root.render(
    <Suspense fallback="">
      <PageLayout
        role={args.role}
        username={args.username}
        mapboxToken={args.mapboxToken}
        mapquestKey={args.mapquestKey}
        theMap="homeMap"
        versionDeployed={args.versionDeployed}
        showSearch={true}
      >
        <HomeContents />
      </PageLayout>
    </Suspense>
  );
}

const Buttons = styled.div`
  display: flex;
  flex: 3;
  justify-content: space-around;

  @media only screen and (max-width: 1000px) {
    flex: 5;
  }
`;

const Logo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: space-evenly;
  padding: 5px 0;

  @media only screen and (max-width: 1000px) {
    flex: 1;
  }
`;

const LogoGitVersion = styled.a`
  color: var(--white);
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0px;
  text-align: left;
  text-decoration: none;

  @media only screen and (max-width: 1000px) {
    display: none;
  }
`;

const BarItem = styled.div``;
