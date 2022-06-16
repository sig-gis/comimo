import React, {useEffect, useContext} from "react";
import ReactDOM from "react-dom";
import {atom, useAtom} from "jotai";
import {last} from "lodash";

import MenuItem from "../components/MenuItem";
import NICFIControl from "../components/NICFIControl";
import {PageLayout, MainContext} from "../components/PageLayout";
import SideBar from "../components/SideBar";
import SideIcon from "../components/SideIcon";
import ToolPanel from "../components/ToolPanel";
import LoadingModal from "../components/LoadingModal";

import {URLS} from "../constants";
import {jsonRequest} from "../utils";
import CollectMap from "./CollectMap";
import NavBar from "./NavBar";

const visiblePanel = atom(null);
const projectDetails = atom({});
const projectPlots = atom([]);
const currentPlotId = atom(-1);
const extraParams = atom({
    NICFI: {
        dataLayer: null,
        band: "rgb"
    }
});
const nicfiLayers = atom([]);
const showModal = atom(null);

const togglePanel = panelKey => {
  const [visiblePanel, setVisiblePanel] = useAtom(visiblePanel);
  setVisiblePanel(panelKey === visiblePanel ? null : panelKey);
};

const nextPlot = () => {
  const [currentPlotId, setCurrentPlotId] = useAtom(currentPlotId);
  const [projectPlots, _] = useAtom(projectPlots);
  const nextPlot = projectPlots.find(p => p.id > currentPlotId) || projectPlots[0];
  setCurrentPlotId(nextPlot.id);
};

const prevPlot = () => {
  const [currentPlotId, setCurrentPlotId] = useAtom(currentPlotId);
  const [projectPlots, _] = useAtom(projectPlots);
  const plotsCopy = [...projectPlots].reverse();
  const prevPlot = plotsCopy.find(p => p.id < currentPlotId) || plotsCopy[0];
  setCurrentPlotId(prevPlot.id);
};

const setPlotAnswer = answer => {
  const [currentPlotId, _] = useAtom(currentPlotId);
  const [projectPlots, setProjectPlots] = useAtom(projectPlots);
  return jsonRequest(URLS.SAVE_ANSWER, {plotId: currentPlotId, answer})
    .then(() => {
      const newProjectPlots = projectPlots.map(p => p.id === currentPlotId ? {...p, answer} : p);
      setProjectPlots(newProjectPlots);
    })
    .catch(() => {
      alert("Error Saving plot");
    });
};

const setParams = (param, value) => {
  const [extraParams, setExtraParams] = useAtom(extraParams);
  setExtraParams({
    ...extraParams,
    [param]: value
  });
};

const geomToKML = geom => {
  const coordinates = geom.coordinates[0];
  const strCoords = coordinates.map(c => c.join(",")).join(" ");
  return "<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd\"><Document><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>"
    + strCoords
    + "</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>";
};

const processModal = callBack => {
    const [showModal, setShowModal] = useAtom(showModal);
    return new Promise(() => Promise.resolve(
        setShowModal(true),
        () => callBack().finally(() => setShowModal(false))
    ));
};

const getProjectData = projectId => {
    const [projectDetails, setProjectDetails] = useAtom(projectDetails);
    return jsonRequest(URLS.PROJ_DATA, {projectId: projectId})
        .then(result => {
            setProjectDetails(result);
            return result;
        });
};

// TODO, this can probably be combined into get projectData
const getProjectPlots = projectId => {
    const [projectPlots, setProjectPlots] = useAtom(projectPlots);
    return jsonRequest(URLS.PROJ_PLOTS, {projectId: projectId})
        .then(result => {
            setProjectPlots(result);
        });
};

const getNICFIDates = () => {
    const [nicfiLayers, setNicfiLayers] = useAtom(nicfiLayers);
    return jsonRequest(URLS.NICFI_DATES)
        .then(dates => {
            setNicfiLayers(dates);
            return dates;
        });
};

function CollectContent({projectId, mapboxToken}) {
  const [extraParams, _] = useAtom(extraParams);
  const [projectDetails, _] = useAtom(projectDetails);
  const [currentPlotId, _] = useAtom(currentPlotId);
  const [projectPlots, _] = useAtom(projectPlots);
  const [showModal, _] = useAtom(showModal);
  const [visiblePanel, _] = useAtom(visiblePanel);
  const [nicfiLayers, _] = useAtom(nicfiLayers);
  const currentPlot = projectPlots.find(p => p.id === currentPlotId);
  const {setShowInfo, myHeight, localeText: {home}} = useContext(MainContext);

  useEffect(() => {
    processModal(() => Promise.all([getProjectData(projectId), getProjectPlots(projectId), getNICFIDates()]))
      .then(([projectDetails, _, nicfiLayers]) => {
        const dateRegex = /\d{4}-\d{2}/g;
        const projectDate = last([...projectDetails.dataLayer.matchAll(dateRegex)])[0];
        const nicfiDate = nicfiLayers.find(l => [...l.matchAll(dateRegex)].length === 1 && l.includes(projectDate));
        setParams("NICFI", {
          ...extraParams.NICFI,
          dataLayer: nicfiDate || nicfiLayers[0]
        });
      });
  }, []);

  return (
    <>
      {showModal && <LoadingModal message={home?.loading}/>}
      <CollectMap
        boundary={projectDetails.boundary}
        currentPlot={currentPlot}
        extraParams={extraParams}
        mapboxToken={mapboxToken}
        myHeight={myHeight}
        projectPlots={projectPlots}
      />
      {home && (
        <SideBar>
          {/* Layers */}
          <MenuItem
            itemName="layer"
            onClick={togglePanel}
            selectedItem={visiblePanel}
            tooltip={home.layersTooltip}
          >
            <ToolPanel title="Placeholder">
              <div>
                <NICFIControl
                  extraParams={extraParams}
                  nicfiLayers={nicfiLayers}
                  setParams={setParams}
                />
                {currentPlot?.geom && (
                  <a
                    download={"comimo_projectId-" + projectId + "_plotId-" + currentPlotId + ".kml"}
                    href={"data:earth.kml+xml application/vnd.google-earth.kmz, " + encodeURIComponent(geomToKML(currentPlot?.geom))}
                  >
                    Download Plot KML
                  </a>
                )}
              </div>
            </ToolPanel>
          </MenuItem>
          <SideIcon
            clickHandler={() => setShowInfo(true)}
            icon="info"
            parentClass="disclaimer"
            tooltip={home.appInfoTooltip}
          />
        </SideBar>
      )}
      <NavBar
        currentPlotId={currentPlotId}
        nextPlot={nextPlot}
        prevPlot={prevPlot}
        setPlotAnswer={setPlotAnswer}
      />
    </>
  );
}

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
    >
      <CollectContent
        mapboxToken={args.mapboxToken}
        projectId={parseInt(args.projectId || 0)}
      />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
