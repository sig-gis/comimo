import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { atom, useAtom } from "jotai";
import mapboxgl from "mapbox-gl";
import React, { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import DownloadPanel from "./home/DownloadPanel";
import FilterPanel from "./home/FilterPanel";
import HomeMap from "./home/HomeMap";
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

const Buttons = styled.div`
  background-color: white;
  display: flex;
  flex: 3;
  justify-content: center;
`;

const MoreButtons = styled.div`
  flex: 1;
  background-color: red;
`;

const Logo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
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
  display: flex;
  flex-direction: column;
`;

export const selectedDatesAtom = atom({});
// export const selectDates = (newDates) => setSelectedDates({ ...selectedDates, ...newDates });
// TODO fix this

/// Global Map Functions ///

function HomeContents({ mapquestKey, mapboxToken, version }) {
  // Initial state
  const [visiblePanel, setVisiblePanel] = useState(null);
  const [imageDates, setImageDates] = useState({});
  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [featureNames, setFeatureNames] = useState({});
  const [subscribedList, setSubscribedList] = useState([]);
  const [thePopup, setThePopup] = useState(null);
  const map = useRef(null);
  const [extraParams, setExtraParams] = useState({
    NICFI: {
      dataLayer: null,
      band: "rgb",
    },
  });
  const [nicfiLayers, setNicfiLayers] = useState([]);
  const {
    localeText,
    localeText: { home },
    username,
  } = useContext(MainContext);

  // Effects
  useEffect(() => {
    Promise.all([getFeatureNames(), getImageDates(), getNICFIDates()]).catch((error) =>
      console.error(error)
    );
  }, []);

  // State update
  const togglePanel = (panelKey) => {
    setVisiblePanel(panelKey === visiblePanel ? null : panelKey);
  };

  const setParams = (param, value) => {
    setExtraParams({
      ...extraParams,
      [param]: value,
    });
  };

  // API Calls
  const getImageDates = () =>
    jsonRequest(URLS.IMG_DATES).then((result) => {
      const initialDates = Object.keys(result).reduce(
        (acc, cur) => ({ ...acc, [cur]: result[cur][0] }),
        {}
      );

      setImageDates(result);
      setSelectedDates(initialDates);
    });

  const getFeatureNames = () => {
    jsonRequest(URLS.FEATURE_NAMES).then((features) => {
      setFeatureNames(features);
    });
  };

  const getNICFIDates = () => {
    jsonRequest(URLS.NICFI_DATES).then((dates) => {
      setNicfiLayers(dates);
      setParams("NICFI", { ...extraParams.NICFI, dataLayer: dates[0] });
    });
  };

  // console.log("The map in home: ", theMap);
  // Render
  return (
    <>
      <HomeMap
        // addPopup={addPopup}
        extraParams={extraParams}
        localeText={localeText}
        mapboxToken={mapboxToken}
        visiblePanel={visiblePanel}
        map={map}

        // selectDates={selectDates}
        // selectedDates={selectedDates}
      />
      {home && (
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
                  // onClick={() => togglePanel("layers")}
                  text="Layers"
                />

                <LayersPanel
                  active={visiblePanel === "layers"}
                  extraParams={extraParams}
                  nicfiLayers={nicfiLayers}
                  setParams={setParams}
                  map={map.current}
                />
              </BarItem>

              {/* Subscribe */}
              <div
                css={css`
                  display: flex;
                  flex-direction: column;
                `}
              >
                <IconTextButton
                  active={visiblePanel === "subscribe"}
                  hasBackground={true}
                  icon="envelope"
                  onClick={() => togglePanel("subscribe")}
                  text="Subscribe"
                />

                <Hidable active={visiblePanel === "subscribe"}>
                  <LayersPanel
                    extraParams={extraParams}
                    nicfiLayers={nicfiLayers}
                    setParams={setParams}
                    map={map.current}
                  />
                </Hidable>
              </div>

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
            <MoreButtons>
              {/* TODO: move this top bar (menu admin) */}
              {false && isAdmin && (
                <IconButton
                  extraStyle={{ marginRight: "10px" }}
                  icon="admin"
                  onClick={() => window.location.assign("/admin")}
                  // tooltip={localeText.home.admin}
                />
              )}
              <IconButton
                icon="info"
                onClick={() => setShowInfo(true)}
                // tooltip={localeText.home.appInfoTooltip}
              />
            </MoreButtons>
            <Logo id="footer-info-logo">
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
      )}
    </>
  );
}

// class HomeContents extends React.Component {
// set up class flags so each component update doesn't do redundant JS tasks
// constructor(props) {
//   super(props);
// combining everything to app state
//   this.state = {
//     // visiblePanel: null,
//     // advancedOptions: false,
//     // imageDates: {},
//     // selectedDates: {},
//     // selectedRegion: null,
//     // featureNames: {},
//     // subscribedList: [],
//     // theMap: null,
//     // selectedLatLon: null,
//     // extraParams: {
//     //   NICFI: {
//     //     dataLayer: null,
//     //     band: "rgb",
//     //   },
//     // },
//     // nicfiLayers: [],
//   };
// }
/// Lifecycle Functions ///
// componentDidMount() {
//   Promise.all([this.getFeatureNames(), this.getImageDates(), this.getNICFIDates()]).catch(
//     (error) => console.error(error)
//   );
// }
// componentDidUpdate(prevProps, _prevState) {
//   if (prevProps.myHeight !== this.props.myHeight) {
//     setTimeout(() => this.state.theMap.resize(), 50);
//   }
// }
/// State Update ///
// togglePanel = (panelKey) => {
//   const { visiblePanel } = this.state;
//   this.setState({
//     visiblePanel: panelKey === visiblePanel ? null : panelKey,
//   });
// };
// updateSubList = (list) => this.setState({ subscribedList: list });
// selectDates = (newDates) =>
//   this.setState({ selectedDates: { ...this.state.selectedDates, ...newDates } });
// selectRegion = (region) => this.setState({ selectedRegion: region });
// setMap = (theMap) => this.setState({ theMap });
// setLatLon = (latLon) => this.setState({ selectedLatLon: latLon });
// setParams = (param, value) => {
//   this.setState({
//     extraParams: {
//       ...this.state.extraParams,
//       [param]: value,
//     },
//   });
// };
/// API Calls ///
// getImageDates = () =>
//   jsonRequest(URLS.IMG_DATES).then((result) => {
//     const initialDates = Object.keys(result).reduce(
//       (acc, cur) => ({ ...acc, [cur]: result[cur][0] }),
//       {}
//     );
//     this.setState({
//       imageDates: result,
//       selectedDates: initialDates,
//     });
//   });
// getFeatureNames = () =>
//   jsonRequest(URLS.FEATURE_NAMES).then((features) => {
//     this.setState({ featureNames: features });
//   });
// getNICFIDates = () =>
//   jsonRequest(URLS.NICFI_DATES).then((dates) => {
//     this.setState({ nicfiLayers: dates });
//     this.setParams("NICFI", {
//       ...this.state.extraParams.NICFI,
//       dataLayer: dates[0],
//     });
//   });
// /// Global Map Functions ///
// fitMap = (type, arg) => {
//   const {
//     localeText: { home },
//   } = this.context;
//   const { theMap } = this.state;
//   if (type === "point") {
//     try {
//       theMap.flyTo({ center: arg, essential: true });
//     } catch (err) {
//       console.error(home.errorCoordinates);
//     }
//   } else if (type === "bbox") {
//     try {
//       theMap.fitBounds(arg);
//     } catch (error) {
//       console.error(home.errorBounds);
//     }
//   }
// };
// isLayerVisible = (layer) => this.state.theMap.getLayer(layer).visibility === "visible";
// addPopup = (lat, lon) => {
//   const { thePopup } = this.state;
//   const reportPopup = this.state.visiblePanel === "report";
//   const {
//     localeText: { home },
//     localeText,
//   } = this.context;
//   // Remove old popup
//   if (thePopup) thePopup.remove();
//   const divId = Date.now();
//   const popup = new mapboxgl.Popup()
//     .setLngLat([lon, lat])
//     .setHTML(`<div id="${divId}"></div>`)
//     .addTo(this.state.theMap);
//   this.setState({ thePopup: popup });
//   this.setLatLon([lat, lon]);
//   if (reportPopup) {
//     ReactDOM.render(
//       <ReportPopupContent lat={lat} localeText={localeText} lon={lon} />,
//       document.getElementById(divId)
//     );
//   } else {
//     const visibleLayers = availableLayers
//       .map((l) => this.isLayerVisible(l) && l)
//       .filter((l) => l);
//     ReactDOM.render(
//       <InfoPopupContent
//         lat={lat}
//         localeText={home}
//         lon={lon}
//         selectedDates={this.state.selectedDates}
//         visibleLayers={visibleLayers}
//       />,
//       document.getElementById(divId)
//     );
//   }
// };
// render() {
// const {
//   setShowInfo,
//   myHeight,
//   username,
//   localeText: { home },
//   isAdmin,
// } = this.context;
// return (
//   <>
//     <HomeMap
//       extraParams={this.state.extraParams}
//       localeText={this.context.localeText}
//       mapboxToken={this.props.mapboxToken}
//       myHeight={myHeight}
//       selectDates={this.selectDates}
//       selectedDates={this.state.selectedDates}
//       setMap={this.setMap}
//       theMap={this.state.theMap}
//       addPopup={this.addPopup}
//     />
//     {home && (
//       <SideBar>
//         {/* Layers */}
//         <MenuItem
//           itemName="layer"
//           onClick={this.togglePanel}
//           selectedItem={this.state.visiblePanel}
//           tooltip={home.layersTooltip}
//         >
//           <LayersPanel
//             extraParams={this.state.extraParams}
//             nicfiLayers={this.state.nicfiLayers}
//             setParams={this.setParams}
//             theMap={this.state.theMap}
//           />
//         </MenuItem>
//         {/* Subscribe */}
//         <MenuItem
//           icon="envelope"
//           itemName="subscribe"
//           onClick={this.togglePanel}
//           selectedItem={this.state.visiblePanel}
//           tooltip={home.subscribeTooltip}
//         >
//           <SubscribePanel
//             featureNames={this.state.featureNames}
//             fitMap={this.fitMap}
//             mapquestKey={this.props.mapquestKey}
//             selectedRegion={this.state.selectedRegion}
//             selectRegion={this.selectRegion}
//             subscribedList={this.state.subscribedList}
//             updateSubList={this.updateSubList}
//           />
//         </MenuItem>
//         {/* Validation */}
//         <MenuItem
//           icon="check"
//           itemName="validate"
//           onClick={this.togglePanel}
//           selectedItem={this.state.visiblePanel}
//           tooltip={home.validateTooltip}
//         >
//           <ValidatePanel
//             featureNames={this.state.featureNames}
//             selectedDates={this.state.selectedDates}
//             subscribedList={this.state.subscribedList}
//           />
//         </MenuItem>
//         {/* Advanced Button */}
//         {username && (
//           <IconButton
//             icon={this.state.advancedOptions ? "minus" : "plus"}
//             onClick={() => {
//               this.setState(
//                 this.state.advancedOptions
//                   ? { advancedOptions: false, ...this.advancedPanelState }
//                   : { advancedOptions: true }
//               );
//             }}
//             tooltip={home.advancedTooltip}
//           />
//         )}
//         {this.state.advancedOptions && (
//           <>
//             {/* Stats graphs */}
//             <MenuItem
//               itemName="stats"
//               onClick={this.togglePanel}
//               selectedItem={this.state.visiblePanel}
//               tooltip={home.statsTooltip}
//             >
//               <StatsPanel
//                 selectedDate={this.state.selectedDates.cMines}
//                 subscribedList={this.state.subscribedList}
//               />
//             </MenuItem>
//             {/* Date filter */}
//             <MenuItem
//               itemName="filter"
//               onClick={this.togglePanel}
//               selectedItem={this.state.visiblePanel}
//               tooltip={home.filterTooltip}
//             >
//               <FilterPanel
//                 imageDates={this.state.imageDates}
//                 selectDates={this.selectDates}
//                 selectedDates={this.state.selectedDates}
//               />
//             </MenuItem>
//             {/* Report mines */}
//             <MenuItem
//               icon="mine"
//               itemName="report"
//               onClick={this.togglePanel}
//               selectedItem={this.state.visiblePanel}
//               tooltip={home.reportTooltip}
//             >
//               <ReportMinesPanel
//                 addPopup={this.addPopup}
//                 fitMap={this.fitMap}
//                 selectedLatLon={this.state.selectedLatLon}
//                 submitMine={this.submitMine}
//               />
//             </MenuItem>
//             {/* Download */}
//             <MenuItem
//               itemName="download"
//               onClick={this.togglePanel}
//               selectedItem={this.state.visiblePanel}
//               tooltip={home.downloadTooltip}
//             >
//               <DownloadPanel
//                 featureNames={this.state.featureNames}
//                 fitMap={this.fitMap}
//                 mapquestKey={this.props.mapquestKey}
//                 selectedDates={this.state.selectedDates}
//                 selectedRegion={this.state.selectedRegion}
//                 selectRegion={this.selectRegion}
//               />
//             </MenuItem>
//           </>
//         )}
//       </SideBar>
//     )}
//   </>
// );
// }
// }

export function pageInit(args) {
  ReactDOM.render(
    <React.StrictMode>
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
      </PageLayout>
    </React.StrictMode>,

    document.getElementById("main-container")
  );
}
