import React from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import AppInfo from "./AppInfo";
import DownloadPanel from "./DownloadPanel";
import LayersPanel from "./LayersPanel";
import LanguageSelector from "../components/LanguageSelector";
import FilterPanel from "./FilterPanel";
import SearchPanel from "./SearchPanel";
import SideIcon from "./SideIcon";
import StatsPanel from "./StatsPanel";
import SubscribePanel from "./SubscribePanel";
import SvgIcon from "../components/SvgIcon";
import ReportMinesPanel from "./ReportMinesPanel";
import ValidatePanel from "./ValidatePanel";

import {toPrecision, getCookie, getLanguage} from "../utils";
import {MainContext} from "./context";
import {mapboxToken} from "../appConfig";

export default class PageLayout extends React.Component {
  // set up class flags so each component update doesn't do redundant JS tasks
  constructor(props) {
    super(props);

    // API URLS
    this.URLS = {
      FEATURE_NAMES: "api/getfeaturenames",
      IMG_DATES: "/api/getimagenames",
      SINGLE_IMAGE: "/api/getsingleimage",
      GEE_LAYER: "api/getgeetiles"
    };
    // Layers available
    this.availableLayers = [
      "cMines",
      "nMines",
      "pMines",
      "municipalBounds",
      "legalMines",
      "otherAuthorizations",
      "tierrasDeCom",
      "resguardos",
      "protectedAreas"
    ];
    this.startVisible = [
      "cMines"
    ];
    // Set panels as a group
    this.panelState = {
      subscribeHidden: true,
      validateHidden: true,
      searchHidden: true,
      appInfoHidden: true
    };
    this.advancedPanelState = {
      slidersHidden: true,
      statsHidden: true,
      downloadHidden: true,
      reportHidden: true
    };
    // combining everything to app state
    this.state = {
      ...this.panelState,
      ...this.advancedPanelState,
      layersHidden: true,
      advancedOptions: false,
      imageDates: {},
      selectedDates: {},
      selectedRegion: false,
      featureNames: {},
      subscribedList: [],
      theMap: null,
      myHeight: 0,
      localeText: {},
      selectLanguage: "en",
      selectedLatLon: null,
      thePopup: null
    };
  }

  /// Lifecycle Functions ///

  componentDidMount() {
    const lang = ["en", "es"].includes(this.props.defaultLang)
      ? this.props.defaultLang
      : getLanguage(["en", "es"]);
    this.setState({selectedLanguage: lang});

    Promise.all([this.getLocalText(lang), this.getFeatureNames(), this.getImageDates()])
      .then(() => {
        this.updateEELayer(true);
      })
      .catch(error => console.error(error));
    this.updateWindow();
    this.initMap();
    window.addEventListener("touchend", this.updateWindow);
    window.addEventListener("resize", this.updateWindow);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.myHeight !== this.state.myHeight) {
      setTimeout(() => this.state.theMap.resize(), 50);
    }

    if (this.state.thePopup && prevState.reportHidden !== this.state.reportHidden) {
      this.setState({selectedLatLon: null});
      this.state.thePopup.remove();
    }
  }

    updateWindow = () => {
      window.scrollTo(0, 0);
      this.setState({myHeight: window.innerHeight});
    };

    /// State Update ///

    togglePanel = panelKey => this.setState({
      ...this.panelState,
      ...this.advancedPanelState,
      [panelKey]: !this.state[panelKey]
    });

    updateSubList = list => this.setState({subscribedList: list});

    selectDates = newDates => this.setState(
      {selectedDates: {...this.state.selectedDates, ...newDates}},
      this.updateEELayer
    );

    selectRegion = (level, name) => this.setState({selectedRegion: [level, name]});

    selectLanguage = newLang => {
      this.setState({selectedLanguage: newLang});
      this.getLocalText(newLang);
    };

    /// API Calls ///

    getLocalText = lang => fetch(
        `/static/locale/${lang}.json`,
        {headers: {"Cache-Control": "no-cache", "Pragma": "no-cache", "Accept": "application/json"}}
    )
      .then(response => (response.ok ? response.json() : Promise.reject(response)))
      .then(data => this.setState({localeText: data}));

    getImageDates = () => fetch(this.URLS.IMG_DATES)
      .then(res => res.json())
      .then(result => {
        const initialDates = Object.keys(result).reduce((acc, cur) =>
          ({...acc, [cur]: result[cur][0]}), {});
        this.setState({
          imageDates: result,
          selectedDates: initialDates
        });
      });

    getFeatureNames = () => fetch(this.URLS.FEATURE_NAMES)
      .then(res => res.json())
      .then(result => {
        if (result.action === "FeatureNames") this.setState({featureNames: result.features});
      });

    getGEELayers = list => {
      const name = list.shift();
      // TODO make one fetch call for all layer names
      fetch(this.URLS.GEE_LAYER + "?name=" + name)
        .then(res => res.json())
        .then(result => {
          const {url} = result;
          if (url) {
            const style = this.state.theMap.getStyle();
            style.sources[name].tiles = [result.url];
            this.state.theMap.setStyle(style);
          }
          if (list.length > 0) this.getGEELayers(list);
        })
        .catch(error => console.error(error));
    };

    updateEELayer = (firstTime = false) => {
      const eeLayers = ["nMines", "pMines", "cMines"];
      const {theMap, selectedDates} = this.state;
      eeLayers.forEach(eeLayer => {
        fetch(this.URLS.SINGLE_IMAGE + "?id=" + selectedDates[eeLayer] + "&type=" + eeLayer)
          .then(res => res.json())
          .then(result => {
            const style = theMap.getStyle();
            const layers = style.layers;
            const layerIdx = layers.findIndex(l => l.id === eeLayer);
            const thisLayer = layers[layerIdx];
            const {layout: {visibility}} = thisLayer;
            style.sources[eeLayer].tiles = [result.url];
            style.layers[layerIdx] = {
              ...thisLayer,
              layout: {visibility: firstTime && this.startVisible.includes(eeLayer) ? "visible" : visibility}
            };
            theMap.setStyle(style);
          })
          .catch(error => console.error(error));
      });
    };

    /// Mapbox TODO move to separate component

    initMap = () => {
      mapboxgl.accessToken = mapboxToken;
      const theMap = new mapboxgl.Map({
        container: "mapbox",
        style: "mapbox://styles/mapbox/satellite-streets-v9",
        center: [-73.5609339, 4.6371205],
        zoom: 5
      });
      this.setState({theMap});

      theMap.on("load", () => {
        theMap.addControl(new mapboxgl.NavigationControl({showCompass: false}));

        // these are launched async it only works because the fetch command takes longer than creating a layer
        this.addLayerSources([...this.availableLayers].reverse());
        this.getGEELayers(this.availableLayers.slice(3));

        theMap.on("mousemove", e => {
          const lat = toPrecision(e.lngLat.lat, 4);
          const lng = toPrecision(e.lngLat.lng, 4);
          const hudShell = document.getElementById("lnglathud-shell");
          const hud = document.getElementById("lnglathud");
          hudShell.style.display = "inherit";
          hud.innerHTML = lat + ", " + lng;
        });
        theMap.on("mouseout", () => {
          const hudShell = document.getElementById("lnglathud-shell");
          hudShell.style.display = "none";
        });
        theMap.on("click", e => {
          const {lng, lat} = e.lngLat;
          this.addPopup(lat, lng);
        });
      });
    };

    addPopup = (lat, lon) => {
      const {theMap, selectedDates, thePopup, localeText: {home}, localeText} = this.state;
      const {reportHidden} = this.state;

      // Remove old popup
      if (thePopup) thePopup.remove();

      const divId = Date.now();
      const popup = new mapboxgl.Popup()
        .setLngLat([lon, lat])
        .setHTML(`<div id="${divId}"></div>`)
        .addTo(theMap);
      this.setState({thePopup: popup});
      if (reportHidden) {
        const visibleLayers = this.availableLayers.map(l => this.isLayerVisible(l) && l).filter(l => l);
        ReactDOM.render(
          <InfoPopupContent
            lat={lat}
            localeText={home}
            lon={lon}
            selectedDates={selectedDates}
            visibleLayers={visibleLayers}
          />, document.getElementById(divId)
        );
      } else {
        this.setState({selectedLatLon: [lat, lon]});
        ReactDOM.render(
          <ReportPopupContent
            lat={lat}
            localeText={localeText}
            lon={lon}
          />, document.getElementById(divId)
        );
      }
    };

    fitMap = (type, arg) => {
      const {theMap, localeText: {home}} = this.state;
      if (type === "point") {
        try {
          theMap.flyTo({center: arg, essential: true});
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

    isLayerVisible = layer => this.state.theMap.getLayer(layer).visibility === "visible";

    // Adds layers initially with no styling, URL is updated later.
    addLayerSources = list => {
      const {theMap} = this.state;
      list.forEach(name => {
        theMap.addSource(name, {type: "raster", tiles: [], tileSize: 256, vis: {palette: []}});
        theMap.addLayer({
          id: name,
          type: "raster",
          source: name,
          minzoom: 0,
          maxzoom: 22,
          layout: {visibility: "none"}
        });
      });
    };

    /// Render Functions ///

    renderUserButton = () => {
      const {username} = this.props;
      return (
        <div
          onClick={() => window.location.assign("/user-account")}
          style={{display: "flex", alignItems: "center", cursor: "pointer"}}
        >
          <span className="px-2">{username}</span>
          <SvgIcon icon="user" size="1.2rem"/>
        </div>
      );
    };

    renderLanguage = () => (
      <LanguageSelector
        selectedLanguage={this.state.selectedLanguage}
        selectLanguage={this.selectLanguage}
      />
    );

    // set up actions to render app
    render() {
      const {myHeight, localeText: {home}} = this.state;
      const {isUser} = this.props;
      return (
        <MainContext.Provider
          value={{
            isAdmin: this.props.isAdmin,
            isUser: this.props.isUser,
            selectedDates: this.state.selectedDates,
            selectedRegion: this.state.selectedRegion,
            featureNames: this.state.featureNames,
            subscribedList: this.state.subscribedList,
            localeText: this.state.localeText,
            selectedLanguage: this.state.selectedLanguage
          }}
        >
          <div
            id="root-component"
            style={{
              height: myHeight,
              width: "100%",
              margin: 0,
              padding: 0,
              position: "relative"
            }}
          >
            <div
              id="mapbox"
              style={{
                height: "100%",
                width: "100%",
                margin: 0,
                padding: 0,
                position: "relative"
              }}
            />
            <div
              id="desktop-panel"
              style={{
                alignItems: "flex-end",
                display: "flex",
                position: "fixed",
                right: "56px",
                top: "10px",
                zIndex: 1000
              }}
            >
              {isUser && (
                <button
                  style={{
                    alignItems: "center",
                    border: "2px solid",
                    background: "white",
                    borderRadius: "8px",
                    display: "flex",
                    padding: "2px",
                    marginRight: ".5rem"
                  }}
                  type="button"
                >
                  {this.renderUserButton()}
                </button>
              )}
              {this.renderLanguage()}
            </div>
            <div id="mobile-title">
              <h2 style={{width: "50%"}}>CoMiMo</h2>
              <div style={{display: "flex", justifyContent: "flex-end", paddingRight: "1rem", width: "50%"}}>
                {isUser && <div>{this.renderUserButton()}</div>}
                <span className="mx-1"/>
                {this.renderLanguage()}
              </div>
            </div>
            {home && (
              <>
                {/* Layers */}
                <div
                  className="circle layer-group"
                  style={{}}
                >
                  <LayersPanel
                    availableLayers={this.availableLayers}
                    isHidden={this.state.layersHidden}
                    startVisible={this.startVisible}
                    theMap={this.state.theMap}
                  />
                  <SideIcon
                    clickHandler={() => this.setState({layersHidden: !this.state.layersHidden})}
                    icon="layer"
                    parentClass={"layer-icon circle" + (this.state.layersHidden ? "" : " active-icon")}
                    tooltip={home.layersTooltip}
                  />
                </div>

                <div className="sidebar">
                  <div className="sidebar-icon gold-drop app-icon"/>
                  {/* Subscribe */}
                  <SideIcon
                    clickHandler={() => this.togglePanel("subscribeHidden")}
                    icon="envelope"
                    parentClass={this.state.subscribeHidden ? "" : "active-icon"}
                    tooltip={home.subscribeTooltip}
                  />
                  <SubscribePanel
                    isHidden={this.state.subscribeHidden}
                    updateSubList={this.updateSubList}
                  />

                  {/* Validation */}
                  <SideIcon
                    clickHandler={() => this.togglePanel("validateHidden")}
                    icon="check"
                    parentClass={this.state.validateHidden ? "" : "active-icon"}
                    tooltip={home.validateTooltip}
                  />
                  <ValidatePanel isHidden={this.state.validateHidden}/>

                  {/* Geo location Search */}
                  <SideIcon
                    clickHandler={() => this.togglePanel("searchHidden")}
                    icon="search"
                    parentClass={this.state.searchHidden ? "" : "active-icon"}
                    tooltip={home.searchTooltip}
                  />
                  <SearchPanel
                    fitMap={this.fitMap}
                    isHidden={this.state.searchHidden}
                    selectRegion={this.selectRegion}
                  />

                  {/* Advanced Button */}
                  {this.props.isUser && (
                    <SideIcon
                      clickHandler={() => {
                        this.setState(
                          this.state.advancedOptions
                            ? {advancedOptions: false, ...this.advancedPanelState}
                            : {advancedOptions: true}
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
                      <SideIcon
                        clickHandler={() => this.togglePanel("statsHidden")}
                        icon="stats"
                        parentClass={this.state.statsHidden ? "" : "active-icon"}
                        tooltip={home.statsTooltip}
                      />
                      <StatsPanel
                        isHidden={this.state.statsHidden}
                        selectedDate={this.state.selectedDates.cMines}
                        subscribedList={this.state.subscribedList}
                      />

                      {/* Date filter */}
                      <SideIcon
                        clickHandler={() => this.togglePanel("slidersHidden")}
                        icon="filter"
                        parentClass={this.state.slidersHidden ? "" : "active-icon"}
                        tooltip={home.filterTooltip}
                      />
                      <FilterPanel
                        imageDates={this.state.imageDates}
                        isHidden={this.state.slidersHidden}
                        selectDates={this.selectDates}
                      />

                      {/* Report mines */}
                      <SideIcon
                        clickHandler={() => this.togglePanel("reportHidden")}
                        icon="mine"
                        parentClass={this.state.reportHidden ? "" : "active-icon"}
                        tooltip={home.reportTooltip}
                      />
                      <ReportMinesPanel
                        addPopup={this.addPopup}
                        fitMap={this.fitMap}
                        isHidden={this.state.reportHidden}
                        selectedLatLon={this.state.selectedLatLon}
                        submitMine={this.submitMine}
                      />

                      {/* Download */}
                      <SideIcon
                        clickHandler={() => this.togglePanel("downloadHidden")}
                        icon="download"
                        parentClass={this.state.downloadHidden ? "" : "active-icon"}
                        tooltip={home.downloadTooltip}
                      />
                      <DownloadPanel isHidden={this.state.downloadHidden}/>
                    </>
                  )}
                  {/* Info dialogue */}
                  <SideIcon
                    clickHandler={() => this.togglePanel("appInfoHidden")}
                    icon="info"
                    parentClass="disclaimer"
                    tooltip={home.appInfoTooltip}
                  />
                  <AppInfo
                    isHidden={this.state.appInfoHidden}
                    onOuterClick={() => this.togglePanel("appInfoHidden")}
                  />
                </div>
              </>
            )}
            <div id="lnglathud-shell">
              <span id="lnglathud"/>
            </div>
          </div>
        </MainContext.Provider>
      );
    }
}

class InfoPopupContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      layerInfo: {}
    };
  }

  componentDidMount() {
    const {selectedDates, lat, lon, visibleLayers} = this.props;
    if (visibleLayers.length > 0) {
      fetch("api/getinfo",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
              },
              body: JSON.stringify({
                lat,
                lon,
                dates: selectedDates,
                visibleLayers
              })
            })
        .then(resp => resp.json())
        .then(resp => {
          this.setState({layerInfo: resp.value});
        })
        .catch(err => console.error(err));
    }
  }

  render() {
    const {
      layerInfo,
      layerInfo: {
        nMines,
        pMines,
        cMines,
        municipalBounds,
        protectedAreas,
        otherAuthorizations,
        legalMines,
        tierrasDeCom,
        resguardos
      }
    } = this.state;
    const {visibleLayers, localeText, lat, lon} = this.props;
    return Object.keys(layerInfo).length === visibleLayers.length
      ? (
        <div className="d-flex flex-column font-small">
          <div>
            <b>Lat, lon:</b> {toPrecision(lat, 4)}, {toPrecision(lon, 4)}
          </div>
          {visibleLayers.includes("nMines") && (
            <div>
              <b>{localeText.nMines}:</b> {nMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
            </div>
          )}
          {visibleLayers.includes("pMines") && (
            <div>
              <b>{localeText.pMines}:</b> {pMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
            </div>
          )}
          {visibleLayers.includes("cMines") && (
            <div>
              <b>{localeText.cMines}:</b> {cMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
            </div>
          )}
          {visibleLayers.includes("municipalBounds") && (
            <div>
              <b>{localeText.municipalBoundsPopup}:</b> {municipalBounds || localeText.municipalBoundsNotFound}
            </div>
          )}
          {visibleLayers.includes("protectedAreas") && protectedAreas && (
            <div>
              <b>{localeText.protectedAreasPopup}:</b>
              {localeText.protectedAreasCategory}: {protectedAreas[0]}
              {localeText.protectedAreasName}: {protectedAreas[1]}
            </div>
          )}
          {visibleLayers.includes("otherAuthorizations") && otherAuthorizations && (
            <div><b>{localeText.otherAuthorizationsPopup}:</b> {otherAuthorizations}</div>
          )}
          {visibleLayers.includes("legalMines") && legalMines && (
            <div><b>{localeText.legalMinesPopup}:</b> {legalMines}</div>
          )}
          {visibleLayers.includes("tierrasDeCom") && tierrasDeCom && (
            <div><b>{localeText.tierrasDeComPopup}:</b> {tierrasDeCom}</div>
          )}
          {visibleLayers.includes("resguardos") && resguardos && (
            <div><b>{localeText.resguardosPopup}:</b> {resguardos}</div>
          )}
        </div>
      ) : (
        <div>Loading...</div>
      );
  }
}

function ReportPopupContent({lat, lon, localeText: {report}}) {
  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "flex-start"}}>
      <label><b>{report.latitude}</b>:</label>
      <label>{lat}</label>
      <label><b>{report.longitude}</b>:</label>
      <label>{lon}</label>
    </div>
  );
}
