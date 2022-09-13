import { last } from "lodash";
import { useAtom, useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import React, { useEffect, useState, Suspense } from "react";
import ReactDOM from "react-dom";

import {
  PageLayout,
  MainContext,
  myHeightAtom,
  mapboxTokenAtom,
  showInfoAtom,
} from "./components/PageLayout";
import IconButton from "./components/IconButton";
import LoadingModal from "./components/LoadingModal";
import MenuItem from "./components/MenuItem";
import NICFIControl from "./components/NICFIControl";
import SideBar from "./components/SideBar";
import ToolCard from "./components/ToolCard";

import { jsonRequest } from "./utils";
import { URLS } from "./constants";
import { visiblePanelAtom, extraMapParamsAtom, showModalAtom } from "./home";
import CollectMap from "./collect/CollectMap";
import NavBar from "./collect/NavBar";

const CollectContent = ({ projectId }) => {
  const [visiblePanel, setVisisblePanel] = useAtom(visiblePanelAtom);
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const [extraMapParams, setExtraMapParams] = useAtom(extraMapParamsAtom);
  const myHeight = useAtomValue(myHeightAtom);
  const mapboxToken = useAtomValue(mapboxTokenAtom);
  const [showInfo, setShowInfo] = useAtom(showInfoAtom);

  const [projectDetails, setProjectDetails] = useState([]);
  const [projectPlots, setProjectPlots] = useState([]);
  const [currentPlotId, setCurrentPlotId] = useState(-1);

  const { t, i18n } = useTranslation();

  const currentPlot = projectPlots.find((p) => p.id === currentPlotId);

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

  const [nicfiLayers, setNicfiLayers] = useState([]);

  useEffect(() => {
    (async () => {
      const projectDetails = await jsonRequest(URLS.PROJ_DATA, { projectId: projectId }).catch(
        console.error
      );
      setProjectDetails(projectDetails);

      const projectPlots = await jsonRequest(URLS.PROJ_PLOTS, {
        projectId: projectId,
      });
      setProjectPlots(projectPlots);

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

  const nextPlot = () => {
    const nextPlot = projectPlots.find((p) => p.id > currentPlotId) || projectPlots[0];
    currentPlotId === nextPlot.id ? alert(t("home.noMorePlots)")) : setCurrentPlotId(nextPlot.id);
  };

  const goToPlot = (number) => {
    if (number > 0 && number <= projectPlots.length) {
      const nextPlot = projectPlots[number - 1];
      setCurrentPlotId(nextPlot.id);
    }
  };

  const prevPlot = () => {
    const plotsCopy = [...projectPlots].reverse();
    const prevPlot = plotsCopy.find((p) => p.id < currentPlotId) || plotsCopy[0];
    currentPlotId === prevPlot.id ? alert(t("home.noMorePlots")) : setCurrentPlotId(prevPlot.id);
  };

  const setPlotAnswer = async (answer) => {
    try {
      await jsonRequest(URLS.SAVE_ANSWER, { plotId: currentPlotId, answer });
      const newProjectPlots = projectPlots.map((p) =>
        p.id === currentPlotId ? { ...p, answer } : p
      );
      setProjectPlots(newProjectPlots);
    } catch {
      console.error("Error Saving plot");
    }
  };

  /// Helpers ///

  const geomToKML = (geom) => {
    const coordinates = geom.coordinates[0];
    const strCoords = coordinates.map((c) => c.join(",")).join(" ");
    return (
      '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>' +
      strCoords +
      "</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>"
    );
  };
  return (
    <>
      {showModal && <LoadingModal message={t("home.loading") || "Cargando"} />}
      <CollectMap
        boundary={projectDetails.boundary}
        currentPlot={currentPlot}
        // extraParams={extraMapParams}
        goToPlot={goToPlot}
        mapboxToken={mapboxToken}
        myHeight={myHeight}
        projectPlots={projectPlots}
      />

      <SideBar>
        {/* Layers */}
        <MenuItem
          itemName="layer"
          onClick={togglePanel}
          selectedItem={visiblePanel}
          tooltip={t("home.layersTooltip")}
        >
          <ToolCard title="Placeholder">
            <div>
              <NICFIControl
                extraParams={extraMapParams}
                nicfiLayers={nicfiLayers}
                setParams={setParams}
              />
              {currentPlot?.geom && (
                <a
                  download={"comimo_projectId-" + projectId + "_plotId-" + currentPlotId + ".kml"}
                  href={
                    "data:earth.kml+xml application/vnd.google-earth.kmz, " +
                    encodeURIComponent(geomToKML(currentPlot?.geom))
                  }
                >
                  {/* TODO:Needs a translation */}
                  Download Plot KML
                </a>
              )}
            </div>
          </ToolCard>
        </MenuItem>
        <IconButton
          icon="info"
          onClick={() => setShowInfo(true)}
          parentClass="disclaimer"
          tooltip={t("home.appInfoTooltip")}
        />
      </SideBar>
      <NavBar
        currentPlotId={currentPlotId}
        goToPlot={goToPlot}
        nextPlot={nextPlot}
        prevPlot={prevPlot}
        setPlotAnswer={setPlotAnswer}
        shiftPlotId={projectPlots[0]?.id}
      />
    </>
  );
};

// class CollectContent extends React.Component {
// constructor(props) {
//   super(props);

//   // combining everything to app state
//   this.state = {
//     visiblePanel: null,
//     projectDetails: {},
//     projectPlots: [],
//     currentPlotId: -1,
//     extraParams: {
//       NICFI: {
//         dataLayer: null,
//         band: "rgb",
//       },
//     },
//     nicfiLayers: [],
//     showModal: null,
//   };
// }

/// Lifecycle Functions ///

// componentDidMount() {
//   Promise.all([this.getProjectData(), this.getProjectPlots(), this.getNICFIDates()]).then(
//     ([projectDetails, _, nicfiLayers]) => {
//       const dateRegex = /\d{4}-\d{2}/g;
//       const projectDate = last([...projectDetails.dataLayer.matchAll(dateRegex)])[0];
//       const nicfiDate = nicfiLayers.find(
//         (l) => [...l.matchAll(dateRegex)].length === 1 && l.includes(projectDate)
//       );
//       this.setParams("NICFI", {
//         ...this.state.extraParams.NICFI,
//         dataLayer: nicfiDate || nicfiLayers[0],
//       });
//     }
//   );
// }

// getProjectData = () =>
//   jsonRequest(URLS.PROJ_DATA, { projectId: this.props.projectId }).then((result) => {
//     this.setState({ projectDetails: result });
//     return result;
//   });

// TODO, this can probably be combined into get projectData
// getProjectPlots = () =>
//   jsonRequest(URLS.PROJ_PLOTS, { projectId: this.props.projectId }).then((result) => {
//     this.setState({ projectPlots: result });
//   });

// getNICFIDates = () =>
//   jsonRequest(URLS.NICFI_DATES).then((dates) => {
//     this.setState({ nicfiLayers: dates });
//     return dates;
//   });

/// State Update ///

// togglePanel = (panelKey) => {
//   const { visiblePanel } = this.state;
//   this.setState({
//     visiblePanel: panelKey === visiblePanel ? null : panelKey,
//   });
// };

// nextPlot = () => {
//   const {
//     localeText: { home },
//   } = this.context;
//   const { currentPlotId, projectPlots } = this.state;
//   const nextPlot = projectPlots.find((p) => p.id > currentPlotId) || projectPlots[0];
//   currentPlotId === nextPlot.id
//     ? alert(home.noMorePlots)
//     : this.setState({ currentPlotId: nextPlot.id });
// };

// goToPlot = (number) => {
//   const { currentPlotId, projectPlots } = this.state;
//   if (number > 0 && number <= projectPlots.length) {
//     const nextPlot = projectPlots[number - 1];
//     this.setState({ currentPlotId: nextPlot.id });
//   }
// };

// prevPlot = () => {
//   const {
//     localeText: { home },
//   } = this.context;
//   const { currentPlotId, projectPlots } = this.state;
//   const plotsCopy = [...projectPlots].reverse();
//   const prevPlot = plotsCopy.find((p) => p.id < currentPlotId) || plotsCopy[0];
//   currentPlotId === prevPlot.id
//     ? alert(home.noMorePlots)
//     : this.setState({ currentPlotId: prevPlot.id });
// };

// setPlotAnswer = (answer) => {
//   const { currentPlotId, projectPlots } = this.state;
//   jsonRequest(URLS.SAVE_ANSWER, { plotId: this.state.currentPlotId, answer })
//     .then(() => {
//       const newProjectPlots = projectPlots.map((p) =>
//         p.id === currentPlotId ? { ...p, answer } : p
//       );
//       this.setState({ projectPlots: newProjectPlots });
//     })
//     .catch(() => {
//       alert("Error Saving plot");
//     });
// };

// setParams = (param, value) => {
//   this.setState({
//     extraParams: {
//       ...this.state.extraParams,
//       [param]: value,
//     },
//   });
// };

// /// Helpers ///

// geomToKML = (geom) => {
//   const coordinates = geom.coordinates[0];
//   const strCoords = coordinates.map((c) => c.join(",")).join(" ");
//   return (
//     '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>' +
//     strCoords +
//     "</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>"
//   );
// };

// render() {
// const { projectDetails, currentPlotId, projectPlots } = this.state;
// const {
//   setShowInfo,
//   myHeight,
//   localeText: { home },
// } = this.context;
// const currentPlot = projectPlots.find((p) => p.id === currentPlotId);
//   return (
//     <>
//       {this.state.showModal && <LoadingModal message={t("home.loading") || "Cargando"} />}
//       <CollectMap
//         boundary={projectDetails.boundary}
//         currentPlot={currentPlot}
//         extraParams={this.state.extraParams}
//         goToPlot={this.goToPlot}
//         mapboxToken={this.props.mapboxToken}
//         myHeight={myHeight}
//         projectPlots={projectPlots}
//       />
//       {home && (
//         <SideBar>
//           {/* Layers */}
//           <MenuItem
//             itemName="layer"
//             onClick={this.togglePanel}
//             selectedItem={this.state.visiblePanel}
//             tooltip={home.layersTooltip}
//           >
//             <ToolCard title="Placeholder">
//               <div>
//                 <NICFIControl
//                   extraParams={this.state.extraParams}
//                   nicfiLayers={this.state.nicfiLayers}
//                   setParams={this.setParams}
//                 />
//                 {currentPlot?.geom && (
//                   <a
//                     download={
//                       "comimo_projectId-" +
//                       this.props.projectId +
//                       "_plotId-" +
//                       this.state.currentPlotId +
//                       ".kml"
//                     }
//                     href={
//                       "data:earth.kml+xml application/vnd.google-earth.kmz, " +
//                       encodeURIComponent(this.geomToKML(currentPlot?.geom))
//                     }
//                   >
//                     Download Plot KML
//                   </a>
//                 )}
//               </div>
//             </ToolCard>
//           </MenuItem>
//           <IconButton
//             icon="info"
//             onClick={() => setShowInfo(true)}
//             parentClass="disclaimer"
//             tooltip={home.appInfoTooltip}
//           />
//         </SideBar>
//       )}
//       <NavBar
//         currentPlotId={this.state.currentPlotId}
//         goToPlot={this.goToPlot}
//         nextPlot={this.nextPlot}
//         prevPlot={this.prevPlot}
//         setPlotAnswer={this.setPlotAnswer}
//         shiftPlotId={projectPlots[0]?.id}
//       />
//     </>
//   );
// }
// }
// CollectContent.contextType = MainContext;

export function pageInit(args) {
  ReactDOM.render(
    <Suspense fallback="">
      <PageLayout
        role={args.role}
        username={args.username}
        mapboxToken={args.mapboxToken}
        mapquestKey={args.mapquestKey}
        versionDeployed={args.versionDeployed}
        showSearch={false}
      >
        <CollectContent projectId={parseInt(args.projectId || 0)} />
      </PageLayout>
    </Suspense>,
    document.getElementById("main-container")
  );
}
