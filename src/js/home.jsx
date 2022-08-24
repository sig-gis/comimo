import React, { useContext, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { atom, useAtom } from "jotai";
import mapboxgl from "mapbox-gl";

import DownloadPanel from "./home/DownloadPanel";
import FilterPanel from "./home/FilterPanel";
import HomeMap from "./home/HomeMap";
import InfoPopupContent from "./home/InfoPopupContent";
import LayersPanel from "./home/LayersPanel";
import MenuItem from "./components/MenuItem";
import ReportMinesPanel from "./home/ReportMinesPanel";
import ReportPopupContent from "./home/ReportPopupContent";
import SideBar from "./components/SideBar";
import StatsPanel from "./home/StatsPanel";
import SubscribePanel from "./home/SubscribePanel";
import ValidatePanel from "./home/ValidatePanel";
import { MainContext, PageLayout } from "./components/PageLayout";

import { jsonRequest } from "./utils";
import { availableLayers, URLS } from "./constants";

export const mapAtom = atom(null);

function HomeContents({ mapquestKey, mapboxToken }) {
  // Initial state
  const [visiblePanel, setVisiblePanel] = useState(null);
  const [imageDates, setImageDates] = useState({});
  const [selectedDates, setSelectedDates] = useState({});
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [featureNames, setFeatureNames] = useState({});
  const [subscribedList, setSubsribedList] = useState([]);
  const [thePopup, setThePopup] = useState(null);
  const [selectedLatLon, setSelectedLatLon] = useState(null);
  const [extraParams, setExtraParams] = useState({
    NICFI: {
      dataLayer: null,
      band: "rgb",
    },
  });
  const [map, setMap] = useAtom(mapAtom);
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

  /// Global Map Functions ///

  const addPopup = (lat, lon) => {
    // Remove old popup
    if (thePopup) thePopup.remove();

    const divId = Date.now();
    const popup = new mapboxgl.Popup()
      .setLngLat([lon, lat])
      .setHTML(`<div id="${divId}"></div>`)
      .addTo(map);

    setThePopup(popup);
    setSelectedLatLon([lat, lon]);

    if (visiblePanel === "report") {
      ReactDOM.render(
        <ReportPopupContent lat={lat} localeText={localeText} lon={lon} />,
        document.getElementById(divId)
      );
    } else {
      const visibleLayers = availableLayers.map((l) => isLayerVisible(l) && l).filter((l) => l);
      ReactDOM.render(
        <InfoPopupContent
          lat={lat}
          // localeText={home}
          lon={lon}
          selectedDates={selectedDates}
          visibleLayers={visibleLayers}
        />,
        document.getElementById(divId)
      );
    }
  };

  const fitMap = (type, arg) => {
    if (type === "point") {
      try {
        map.flyTo({ center: arg, essential: true });
      } catch (err) {
        console.error(home.errorCoordinates);
      }
    } else if (type === "bbox") {
      try {
        map.fitBounds(arg);
      } catch (error) {
        console.error(home.errorBounds);
      }
    }
  };

  const isLayerVisible = (layer) => map.getLayer(layer).visibility === "visible";

  // State update
  const togglePanel = (panelKey) => {
    setVisiblePanel(panelKey === visiblePanel ? null : panelKey);
  };

  const selectDates = (newDates) => setSelectedDates({ ...selectedDates, ...newDates });

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
      selectDates(initialDates);
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
        addPopup={addPopup}
        extraParams={extraParams}
        localeText={localeText}
        mapboxToken={mapboxToken}
        // selectDates={selectDates}
        selectedDates={selectedDates}
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
            <LayersPanel
              extraParams={extraParams}
              nicfiLayers={nicfiLayers}
              setParams={setParams}
              theMap={map}
            />
          </MenuItem>

          {/* Subscribe */}
          <MenuItem
            icon="envelope"
            itemName="subscribe"
            onClick={togglePanel}
            selectedItem={visiblePanel}
            tooltip={home.subscribeTooltip}
          >
            <SubscribePanel
              featureNames={featureNames}
              fitMap={fitMap}
              mapquestKey={mapquestKey}
              selectedRegion={selectedRegion}
              selectRegion={setSelectedRegion}
              subscribedList={subscribedList}
              updateSubList={setSubsribedList}
            />
          </MenuItem>

          {/* Validation */}
          <MenuItem
            icon="check"
            itemName="validate"
            onClick={togglePanel}
            selectedItem={visiblePanel}
            tooltip={home.validateTooltip}
          >
            <ValidatePanel
              featureNames={featureNames}
              selectedDates={selectedDates}
              subscribedList={subscribedList}
            />
          </MenuItem>

          {/* Logged in Buttons */}
          {username && (
            <>
              {/* Stats graphs */}
              <MenuItem
                itemName="stats"
                onClick={togglePanel}
                selectedItem={visiblePanel}
                tooltip={home.statsTooltip}
              >
                <StatsPanel selectedDate={selectedDates.cMines} subscribedList={subscribedList} />
              </MenuItem>

              {/* Date filter */}
              <MenuItem
                itemName="filter"
                onClick={togglePanel}
                selectedItem={visiblePanel}
                tooltip={home.filterTooltip}
              >
                <FilterPanel
                  imageDates={imageDates}
                  selectDates={selectDates}
                  selectedDates={selectedDates}
                />
              </MenuItem>

              {/* Report mines */}
              <MenuItem
                icon="mine"
                itemName="report"
                onClick={togglePanel}
                selectedItem={visiblePanel}
                tooltip={home.reportTooltip}
              >
                <ReportMinesPanel
                  addPopup={addPopup}
                  fitMap={fitMap}
                  selectedLatLon={selectedLatLon}
                />
              </MenuItem>

              {/* Download */}
              <MenuItem
                itemName="download"
                onClick={togglePanel}
                selectedItem={visiblePanel}
                tooltip={home.downloadTooltip}
              >
                <DownloadPanel
                  featureNames={featureNames}
                  fitMap={fitMap}
                  mapquestKey={mapquestKey}
                  selectedDates={selectedDates}
                  selectedRegion={selectedRegion}
                  selectRegion={setSelectedRegion}
                />
              </MenuItem>
            </>
          )}
        </SideBar>
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
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
      version={args.version}
    >
      <HomeContents mapboxToken={args.mapboxToken} mapquestKey={args.mapquestKey} />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
