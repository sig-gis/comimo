import mapboxgl from "mapbox-gl";
import React from "react";
import ReactDOM from "react-dom";

import DownloadPanel from "./DownloadPanel";
import FilterPanel from "./FilterPanel";
import HomeMap from "./HomeMap";
import InfoPopupContent from "./InfoPopupContent";
import LayersPanel from "./LayersPanel";
import MenuItem from "../components/MenuItem";
import ReportMinesPanel from "./ReportMinesPanel";
import ReportPopupContent from "./ReportPopupContent";
import SearchPanel from "./SearchPanel";
import SideBar from "../components/SideBar";
import SideIcon from "../components/SideIcon";
import StatsPanel from "./StatsPanel";
import SubscribePanel from "./SubscribePanel";
import ValidatePanel from "./ValidatePanel";
import { PageLayout, MainContext } from "../components/PageLayout";

import { jsonRequest } from "../utils";
import { URLS, availableLayers } from "../constants";

class HomeContents extends React.Component {
  // set up class flags so each component update doesn't do redundant JS tasks
  constructor(props) {
    super(props);

    // combining everything to app state
    this.state = {
      visiblePanel: null,
      advancedOptions: false,
      imageDates: {},
      selectedDates: {},
      selectedRegion: null,
      featureNames: {},
      subscribedList: [],
      theMap: null,
      selectedLatLon: null,
      extraParams: {
        NICFI: {
          dataLayer: null,
          band: "rgb",
        },
      },
      nicfiLayers: [],
    };
  }

  /// Lifecycle Functions ///

  componentDidMount() {
    Promise.all([this.getFeatureNames(), this.getImageDates(), this.getNICFIDates()]).catch(
      (error) => console.error(error)
    );
  }

  componentDidUpdate(prevProps, _prevState) {
    if (prevProps.myHeight !== this.props.myHeight) {
      setTimeout(() => this.state.theMap.resize(), 50);
    }
  }

  /// State Update ///

  togglePanel = (panelKey) => {
    const { visiblePanel } = this.state;
    this.setState({
      visiblePanel: panelKey === visiblePanel ? null : panelKey,
    });
  };

  updateSubList = (list) => this.setState({ subscribedList: list });

  selectDates = (newDates) =>
    this.setState({ selectedDates: { ...this.state.selectedDates, ...newDates } });

  selectRegion = (region) => this.setState({ selectedRegion: region });

  setMap = (theMap) => this.setState({ theMap });

  setLatLon = (latLon) => this.setState({ selectedLatLon: latLon });

  setParams = (param, value) => {
    this.setState({
      extraParams: {
        ...this.state.extraParams,
        [param]: value,
      },
    });
  };

  /// API Calls ///

  getImageDates = () =>
    jsonRequest(URLS.IMG_DATES).then((result) => {
      const initialDates = Object.keys(result).reduce(
        (acc, cur) => ({ ...acc, [cur]: result[cur][0] }),
        {}
      );
      this.setState({
        imageDates: result,
        selectedDates: initialDates,
      });
    });

  getFeatureNames = () =>
    jsonRequest(URLS.FEATURE_NAMES).then((features) => {
      this.setState({ featureNames: features });
    });

  getNICFIDates = () =>
    jsonRequest(URLS.NICFI_DATES).then((dates) => {
      this.setState({ nicfiLayers: dates });
      this.setParams("NICFI", {
        ...this.state.extraParams.NICFI,
        dataLayer: dates[0],
      });
    });

  /// Global Map Functions ///

  fitMap = (type, arg) => {
    const {
      localeText: { home },
    } = this.context;
    const { theMap } = this.state;
    if (type === "point") {
      try {
        theMap.flyTo({ center: arg, essential: true });
      } catch (err) {
        console.error(home.errorCoordinates);
      }
    } else if (type === "bbox") {
      try {
        theMap.fitBounds(arg);
      } catch (error) {
        console.error(home.errorBounds);
      }
    }
  };

  isLayerVisible = (layer) => this.state.theMap.getLayer(layer).visibility === "visible";

  addPopup = (lat, lon) => {
    const { thePopup } = this.state;
    const reportPopup = this.state.visiblePanel === "report";
    const {
      localeText: { home },
      localeText,
    } = this.context;

    // Remove old popup
    if (thePopup) thePopup.remove();

    const divId = Date.now();
    const popup = new mapboxgl.Popup()
      .setLngLat([lon, lat])
      .setHTML(`<div id="${divId}"></div>`)
      .addTo(this.state.theMap);
    this.setState({ thePopup: popup });

    this.setLatLon([lat, lon]);

    if (reportPopup) {
      ReactDOM.render(
        <ReportPopupContent lat={lat} localeText={localeText} lon={lon} />,
        document.getElementById(divId)
      );
    } else {
      const visibleLayers = availableLayers
        .map((l) => this.isLayerVisible(l) && l)
        .filter((l) => l);
      ReactDOM.render(
        <InfoPopupContent
          lat={lat}
          localeText={home}
          lon={lon}
          selectedDates={this.state.selectedDates}
          visibleLayers={visibleLayers}
        />,
        document.getElementById(divId)
      );
    }
  };

  render() {
    const {
      setShowInfo,
      myHeight,
      username,
      localeText: { home },
      isAdmin,
    } = this.context;
    return (
      <>
        <HomeMap
          extraParams={this.state.extraParams}
          localeText={this.context.localeText}
          mapboxToken={this.props.mapboxToken}
          myHeight={myHeight}
          selectDates={this.selectDates}
          selectedDates={this.state.selectedDates}
          setMap={this.setMap}
          theMap={this.state.theMap}
          addPopup={this.addPopup}
        />
        {home && (
          <SideBar>
            {/* Layers */}
            <MenuItem
              itemName="layer"
              onClick={this.togglePanel}
              selectedItem={this.state.visiblePanel}
              tooltip={home.layersTooltip}
            >
              <LayersPanel
                extraParams={this.state.extraParams}
                nicfiLayers={this.state.nicfiLayers}
                setParams={this.setParams}
                theMap={this.state.theMap}
              />
            </MenuItem>

            {/* Subscribe */}
            <MenuItem
              icon="envelope"
              itemName="subscribe"
              onClick={this.togglePanel}
              selectedItem={this.state.visiblePanel}
              tooltip={home.subscribeTooltip}
            >
              <SubscribePanel
                selectedRegion={this.state.selectedRegion}
                subscribedList={this.state.subscribedList}
                updateSubList={this.updateSubList}
              />
            </MenuItem>

            {/* Validation */}
            <MenuItem
              icon="check"
              itemName="validate"
              onClick={this.togglePanel}
              selectedItem={this.state.visiblePanel}
              tooltip={home.validateTooltip}
            >
              <ValidatePanel
                featureNames={this.state.featureNames}
                selectedDates={this.state.selectedDates}
                subscribedList={this.state.subscribedList}
              />
            </MenuItem>

            {/* Geo location Search */}
            <MenuItem
              itemName="search"
              onClick={this.togglePanel}
              selectedItem={this.state.visiblePanel}
              tooltip={home.searchTooltip}
            >
              <SearchPanel
                featureNames={this.state.featureNames}
                fitMap={this.fitMap}
                mapquestKey={this.props.mapquestKey}
                selectedDates={this.state.selectedDates}
                selectRegion={this.selectRegion}
              />
            </MenuItem>

            {/* Advanced Button */}
            {username && (
              <SideIcon
                clickHandler={() => {
                  this.setState(
                    this.state.advancedOptions
                      ? { advancedOptions: false, ...this.advancedPanelState }
                      : { advancedOptions: true }
                  );
                }}
                icon={this.state.advancedOptions ? "minus" : "plus"}
                subtext={home.advancedTooltip}
                tooltip={home.advancedTooltip}
              />
            )}
            {this.state.advancedOptions && (
              <>
                {/* Stats graphs */}
                <MenuItem
                  itemName="stats"
                  onClick={this.togglePanel}
                  selectedItem={this.state.visiblePanel}
                  tooltip={home.statsTooltip}
                >
                  <StatsPanel
                    selectedDate={this.state.selectedDates.cMines}
                    subscribedList={this.state.subscribedList}
                  />
                </MenuItem>

                {/* Date filter */}
                <MenuItem
                  itemName="filter"
                  onClick={this.togglePanel}
                  selectedItem={this.state.visiblePanel}
                  tooltip={home.filterTooltip}
                >
                  <FilterPanel
                    imageDates={this.state.imageDates}
                    selectDates={this.selectDates}
                    selectedDates={this.state.selectedDates}
                  />
                </MenuItem>

                {/* Report mines */}
                <MenuItem
                  itemName="report"
                  onClick={this.togglePanel}
                  selectedItem={this.state.visiblePanel}
                  tooltip={home.reportTooltip}
                >
                  <ReportMinesPanel
                    addPopup={this.addPopup}
                    fitMap={this.fitMap}
                    selectedLatLon={this.state.selectedLatLon}
                    submitMine={this.submitMine}
                  />
                </MenuItem>

                {/* Download */}
                <MenuItem
                  itemName="download"
                  onClick={this.togglePanel}
                  selectedItem={this.state.visiblePanel}
                  tooltip={home.downloadTooltip}
                >
                  <DownloadPanel
                    selectedDates={this.state.selectedDates}
                    selectedRegion={this.state.selectedRegion}
                  />
                </MenuItem>
              </>
            )}
            <div style={{ flexGrow: 1 }} />
            {isAdmin && (
              <SideIcon
                clickHandler={() => window.location.assign("/admin")}
                icon="admin"
                tooltip={home.admin}
              />
            )}
            <SideIcon
              clickHandler={() => setShowInfo(true)}
              icon="info"
              tooltip={home.appInfoTooltip}
            />
          </SideBar>
        )}
      </>
    );
  }
}
HomeContents.contextType = MainContext;

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
