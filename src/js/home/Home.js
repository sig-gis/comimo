import React from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import AppInfo from "./AppInfo";
import DownloadPanel from "./DownloadPanel";
import LayersPanel from "./LayersPanel";
import FilterPanel from "./FilterPanel";
import SearchPanel from "./SearchPanel";
import SideIcon from "./SideIcon";
import StatsPanel from "./StatsPanel";
import SubscribePanel from "./SubscribePanel";
import ValidatePanel from "./ValidatePanel";

import {toPrecision, getCookie, getLanguage} from "../utils";
import {MainContext} from "./context";
import {mapboxToken} from "../appConfig";

class Home extends React.Component {
    // set up class flags so each component update doesn't do redundant JS tasks
    constructor(props) {
        super(props);

        // API URLS
        this.URLS = {
            FEATURE_NAMES: "api/getfeaturenames",
            IMG_DATES: "/api/getimagenames",
            SINGLE_IMAGE: "/api/getsingleimage",
            GEE_LAYER: "api/getgeetiles",
            INFO: "api/getinfo"
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
            downloadHidden: true
        };
        // combining everything to app state
        this.state = {
            ...this.panelState,
            ...this.advancedPanelState,
            layersHidden: true,
            advancedOptions: false,
            compositeParams: {},
            imageDates: [],
            selectedDates: {},
            selectedRegion: false,
            featureNames: {},
            subscribedList: [],
            // reload limit for layers that could not be loaded
            reloadCount: 0,
            theMap: null,
            myHeight: 0,
            localeText: null
        };
    }

    // set up parameters after components are mounted
    componentDidMount() {
        this.updateWindow();
        this.initMap();
        Promise.all([this.getLocalText(), this.getFeatureNames(), this.getImageDates()])
            .then(() => {
                this.loadMapLocalEvents();
                this.updateEELayer(true);
            })
            .catch(error => console.log(error));
        window.addEventListener("touchend", this.updateWindow);
        window.addEventListener("resize", this.updateWindow);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.myHeight !== this.state.myHeight) {
            setTimeout(() => this.state.theMap.resize(), 50);
        }
    }

    updateWindow = () => {
        window.scrollTo(0, 0);
        this.setState({myHeight: window.innerHeight});
    };

    /// State update

    togglePanel = panelKey => this.setState({
        ...this.panelState,
        ...this.advancedPanelState,
        [panelKey]: !this.state[panelKey]
    });

    updateSubList = list => this.setState({subscribedList: list});

    selectDates = newDates => this.setState({selectedDates: newDates}, this.updateEELayer);

    selectRegion = (level, name) => this.setState({selectedRegion: [level, name]});

    /// Fetch calls

    getLocalText = () => fetch(
        `/static/locale/${getLanguage(["en", "es"])}.json`,
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
            .catch(error => console.log(error));
    };

    updateEELayer = (firstTime = false) => {
        const eeLayers = ["pMines", "cMines", "nMines"];
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
                .catch(error => console.log(error));
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
        });
    };

    loadMapLocalEvents = () => {
        const {theMap, localeText: {home}} = this.state;
        theMap.on("click", e => {
            const {lat, lng} = e.lngLat;

            const popup = new mapboxgl.Popup({closeOnClick: true})
                .setLngLat([lng, lat])
                .setHTML("<p>Loading...<p>")
                .addTo(theMap);

            const visible = this.availableLayers.map(l => this.isLayerVisible(l) && l).filter(l => l);

            fetch(this.URLS.INFO,
                  {
                      method: "POST",
                      headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json",
                          "X-CSRFToken": getCookie("csrftoken")
                      },
                      body: JSON.stringify({
                          lat,
                          lng,
                          dates: this.state.selectedDates,
                          visible
                      })
                  })
                .then(resp => resp.json())
                .then(resp => {
                    const ln = toPrecision(lng, 4);
                    const lt = toPrecision(lat, 4);
                    let innerHTML = `<b>Lat, lon</b>: ${lt}, ${ln}<br/>`;
                    if (resp.action === "Error") {
                        innerHTML += resp.message;
                    } else {
                        const {
                            nMines,
                            pMines,
                            cMines,
                            municipalBounds,
                            protectedAreas,
                            otherAuthorizations,
                            legalMines,
                            tierrasDeCom,
                            resguardos
                        } = resp.value;
                        if (this.isLayerVisible("nMines")) {
                            const cl = nMines ? home.eeLayerDetected : home.eeLayerNotDetected;
                            innerHTML += `<b>${home.nMines}</b>: ${cl}<br/>`;
                        }
                        if (this.isLayerVisible("pMines")) {
                            const cl = pMines ? home.eeLayerDetected : home.eeLayerNotDetected;
                            innerHTML += `<b>${home.pMines}</b>: ${cl}<br/>`;
                        }
                        if (this.isLayerVisible("cMines")) {
                            const cl = cMines ? home.eeLayerDetected : home.eeLayerNotDetected;
                            innerHTML += `<b>${home.cMines}</b>: ${cl}<br/>`;
                        }
                        if (this.isLayerVisible("municipalBounds")) {
                            const loc = municipalBounds || home.municipalBoundsNotFound;
                            innerHTML += `<b>${home.municipalBoundsPopup}:</b> ${loc}<br/>`;
                        }
                        if (this.isLayerVisible("protectedAreas") && protectedAreas[0]) {
                            const pa = `${home.protectedAreasCategory}: ${protectedAreas[0]}
                                        <br/> ${home.protectedAreasName}: ${protectedAreas[1]}`;
                            innerHTML += `<b>${home.protectedAreasPopup}:</b><br> ${pa}<br/>`;
                        }
                        if (this.isLayerVisible("otherAuthorizations") && otherAuthorizations) {
                            innerHTML += `<b>${home.otherAuthorizationsPopup}:</b> ${otherAuthorizations} <br/>`;
                        }
                        if (this.isLayerVisible("legalMines") && legalMines) {
                            innerHTML += `<b>${home.legalMinesPopup}:</b> ${legalMines} <br/>`;
                        }
                        if (this.isLayerVisible("tierrasDeCom") && tierrasDeCom) {
                            innerHTML += `<b>${home.tierrasDeComPopup}:</b> ${tierrasDeCom} <br/>`;
                        }
                        if (this.isLayerVisible("resguardos") && resguardos) {
                            innerHTML += `<b>${home.resguardosPopup}:</b> ${resguardos} <br/>`;
                        }
                    }
                    popup.setHTML(innerHTML);
                })
                .catch(err => console.log(err));
        });
    };

    fitMap = (type, arg) => {
        const {theMap, localeText: {home}} = this.state;
        if (type === "point") {
            try {
                theMap.flyTo({center: arg, essential: true});
            } catch (err) {
                console.log(home.errorCoordinates);
            }
        } else if (type === "bbox") {
            try {
                theMap.fitBounds(arg);
            } catch (error) {
                console.log(home.errorBounds);
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

    // set up actions to render app
    render() {
        const {myHeight, localeText} = this.state;
        const {home} = localeText || {};
        return (
            <MainContext.Provider
                value={{
                    isAdmin: this.props.isAdmin,
                    isUser: this.props.isUser,
                    selectedDate: this.state.selectedDates.pMines,
                    selectedDates: this.state.selectedDates,
                    selectedRegion: this.state.selectedRegion,
                    featureNames: this.state.featureNames,
                    subscribedList: this.state.subscribedList,
                    localeText: this.state.localeText
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
                    <div id="mobile-title"><h2>Comimo</h2></div>
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
                                        parentClass=""
                                        subtext={home.advancedTooltip}
                                        tooltip={home.advancedTooltip}
                                    />
                                )}
                                {this.state.advancedOptions && (
                                    <React.Fragment>
                                        {/* Stats graphs */}
                                        <SideIcon
                                            clickHandler={() => this.togglePanel("statsHidden")}
                                            icon="stats"
                                            parentClass={this.state.statsHidden ? "" : "active-icon"}
                                            tooltip={home.statsTooltip}
                                        />
                                        <StatsPanel
                                            isHidden={this.state.statsHidden}
                                            selectedDate={this.state.selectedDates.pMines}
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

                                        {/* Download */}
                                        <SideIcon
                                            clickHandler={() => this.togglePanel("downloadHidden")}
                                            icon="download"
                                            parentClass={this.state.downloadHidden ? "" : "active-icon"}
                                            tooltip={home.downloadTooltip}
                                        />
                                        <DownloadPanel isHidden={this.state.downloadHidden}/>
                                    </React.Fragment>
                                )}
                                {/* Info dialoge */}
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

export function pageInit(args) {
    ReactDOM.render(<Home {...args}/>, document.getElementById("main-container"));
}
