import React, { useEffect, useState, Suspense } from "react";
import ReactDOM from "react-dom";
import { last } from "lodash";
import { useAtom, useAtomValue, useSetAtom, atom } from "jotai";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";

import {
  PageLayout,
  myHeightAtom,
  mapboxTokenAtom,
  showInfoAtom,
  versionDeployedAtom,
} from "./components/PageLayout";
import IconButton from "./components/IconButton";
import LoadingModal from "./components/LoadingModal";
import { renderMessageBox } from "./components/Modal";
import FooterBar from "./components/FooterBar";
import IconTextButton from "./components/IconTextButton";

import LayersPanel from "./home/LayersPanel";
import CollectDownload from "./collect/CollectDownload";

import { featureNamesAtom } from "./home";
import { jsonRequest } from "./utils";
import { URLS } from "./constants";
import { visiblePanelAtom, extraMapParamsAtom, showModalAtom } from "./home";
import CollectMap, { collectMapAtom } from "./collect/CollectMap";
import NavBar from "./collect/NavBar";

export const currentPlotIdAtom = atom(-1);
export const currentPlotNumberAtom = atom(1);
export const projectPlotsAtom = atom([]);
export const areAllPlotsValidatedAtom = atom((get) => {
  const projectPlots = get(projectPlotsAtom);
  const areAllPlotsValidated =
    projectPlots.length > 0 &&
    projectPlots.every((p) => p.answer === "Mina" || p.answer === "No Mina");
  return areAllPlotsValidated;
});

const CollectContent = ({ projectId }) => {
  // State
  const collectMap = useAtomValue(collectMapAtom);
  const setFeatureNames = useSetAtom(featureNamesAtom);
  const [visiblePanel, setVisiblePanel] = useAtom(visiblePanelAtom);
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const [extraMapParams, setExtraMapParams] = useAtom(extraMapParamsAtom);
  const [showInfo, setShowInfo] = useAtom(showInfoAtom);
  const myHeight = useAtomValue(myHeightAtom);
  const mapboxToken = useAtomValue(mapboxTokenAtom);
  const versionDeployed = useAtomValue(versionDeployedAtom);
  const [currentPlotId, setCurrentPlotId] = useAtom(currentPlotIdAtom);
  const [currentPlotNumber, setCurrentPlotNumber] = useAtom(currentPlotNumberAtom);
  const areAllPlotsValidated = useAtomValue(areAllPlotsValidatedAtom);

  const [projectDetails, setProjectDetails] = useState([]);
  const [projectPlots, setProjectPlots] = useAtom(projectPlotsAtom);
  const [nicfiLayers, setNicfiLayers] = useState([]);
  const [messageBox, setMessageBox] = useState(null);

  const { t } = useTranslation();

  const currentPlot = projectPlots.find((p) => p.id === currentPlotId);

  const showAlert = (messageBox) => setMessageBox(messageBox);

  // TODO: repetitive in home
  const setParams = (param, value) => {
    setExtraMapParams({
      ...extraMapParams,
      [param]: value,
    });
  };
  // TODO: repetitive in home
  const togglePanel = (panelKey) => {
    setVisiblePanel(panelKey === visiblePanel ? null : panelKey);
  };

  // Effects
  useEffect(() => {
    const getFeatureNames = async () => {
      const features = await jsonRequest(URLS.FEATURE_NAMES);
      setFeatureNames(features);
    };

    getFeatureNames().catch(console.error);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.keyCode === 27) {
        setVisiblePanel(null);
        setShowInfo(null);
      }
    };
    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [visiblePanel]);

  useEffect(() => {
    (async () => {
      const projectDetails = await jsonRequest(URLS.PROJ_DATA, { projectId: projectId }).catch(
        console.error
      );
      setProjectDetails(projectDetails);

      const projectPlots = await jsonRequest(URLS.PROJ_PLOTS, {
        projectId: projectId,
      });
      const startingPlotIndex = projectPlots.findIndex((p) => !p.answer);
      setProjectPlots(projectPlots);
      setCurrentPlotNumber(startingPlotIndex === -1 ? 1 : startingPlotIndex + 1);

      const nicfiLayers = await jsonRequest(URLS.NICFI_DATES);
      setNicfiLayers(nicfiLayers);

      const dateRegex = /\d{4}-\d{2}/g;
      const projectDate = last([...projectDetails.dataLayer.matchAll(dateRegex)])[0];
      const nicfiDate = nicfiLayers.find(
        (l) => [...l.matchAll(dateRegex)].length === 1 && l.includes(projectDate)
      );
      setParams("NICFI", { ...extraMapParams.NICFI, dataLayer: nicfiDate || nicfiLayers[0] });
    })();
  }, []);

  useEffect(() => {
    if (areAllPlotsValidated) {
      showAlert({
        body: t("validate.validated"),
        closeText: t("users.close"),
        title: t("validate.validatedTitle"),
      });
    }
  }, [areAllPlotsValidated]);

  // Helper Functions
  const nextPlot = () => {
    const nextPlot = projectPlots.find((p) => p.id > currentPlotId) || projectPlots[0];
    if (currentPlotId === nextPlot.id) {
      alert(t("home.noMorePlots"));
    } else {
      setCurrentPlotId(nextPlot.id);
      setCurrentPlotNumber(nextPlot.id - projectPlots[0].id + 1);
    }
  };

  const goToPlot = (n = currentPlotNumber) => {
    if (n > 0 && n <= projectPlots.length) {
      const nextPlot = projectPlots[n - 1];
      setCurrentPlotId(nextPlot.id);
    }
  };

  const prevPlot = () => {
    const plotsCopy = [...projectPlots].reverse();
    const prevPlot = plotsCopy.find((p) => p.id < currentPlotId) || plotsCopy[0];
    if (currentPlotId === prevPlot.id) {
      alert(t("home.noMorePlots"));
    } else {
      setCurrentPlotId(prevPlot.id);
      setCurrentPlotNumber(prevPlot.id - projectPlots[0].id + 1);
    }
  };

  const setPlotAnswer = async (answer) => {
    try {
      let answerNumber = null;
      if (answer === "Mina") {
        answerNumber = 1;
      } else if (answer === "No Mina") {
        answerNumber = 2;
      }
      await jsonRequest(URLS.SAVE_ANSWER, {
        plotId: currentPlotId,
        answer,
        answerNumber,
      });
      const newProjectPlots = projectPlots.map((p) =>
        p.id === currentPlotId ? { ...p, answer } : p
      );
      setProjectPlots(newProjectPlots);
    } catch {
      console.error("Error Saving plot");
    }
  };

  /// Render ///

  return (
    <>
      {showModal && <LoadingModal message={t("home.loading")} />}
      <CollectMap
        boundary={projectDetails.boundary}
        currentPlot={currentPlot}
        goToPlot={goToPlot}
        projectPlots={projectPlots}
      />
      {renderMessageBox(messageBox, () => setMessageBox(null))}
      <NavBar
        showAlert={showAlert}
        goToPlot={goToPlot}
        nextPlot={nextPlot}
        prevPlot={prevPlot}
        setPlotAnswer={setPlotAnswer}
        shiftPlotId={projectPlots[0]?.id}
        maxPlotNumber={projectPlots?.length || 1}
      />
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
              nicfiOnly={true}
              theMap={collectMap}
            />
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
            <CollectDownload
              active={visiblePanel === "download"}
              currentPlot={currentPlot}
              currentPlotId={currentPlotId}
              projectId={projectId}
            />
          </BarItem>
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
                ? `https://github.com/sig-gis/comimo/tags/${versionDeployed}`
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
};

const BarItem = styled.div`
  margin: 0 2rem;
`;

const Buttons = styled.div`
  display: flex;
  flex: 3;
  justify-content: flex-start;
`;

const Logo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: space-evenly;
  padding: 5px 0;
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

export function pageInit(args) {
  ReactDOM.render(
    <Suspense fallback="">
      <PageLayout
        role={args.role}
        username={args.username}
        mapboxToken={args.mapboxToken}
        mapquestKey={args.mapquestKey}
        theMap="collectMap"
        versionDeployed={args.versionDeployed}
        showSearch={true}
      >
        <CollectContent projectId={parseInt(args.projectId || 0)} />
      </PageLayout>
    </Suspense>,
    document.getElementById("main-container")
  );
}
