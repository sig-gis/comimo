/* eslint-disable react/jsx-no-undef */
class Home extends React.Component {
    // set up class flags so each component update doesn't do redundant JS tasks
    constructor(props) {
        super(props);

        // API URLS
        this.URLS = {
            FEATURE_NAMES: "api/getfeaturenames",
            IMG_DATES: "/api/getimagenames",
            SINGLE_IMAGE: "/api/getsingleimage",
            COMPOSITE_IMAGE: "/api/getcompositeimage",
            legalMines: "api/getlegalmines",
            GEE_LAYER: "api/getgeetiles",
            MUNS: "api/getmunicipallayer",
            INFO: "api/getinfo"
        };
        // Layers available
        this.availableLayers = {
            eeLayer: "Prediction",
            municipalBounds: "Municipal Boundaries",
            legalMines: "Legal mines",
            otherAuthorizations: "Other Authorizations",
            tierrasDeCom: "Ethnic territories I",
            resguardos: "Ethnic territories II",
            protectedAreas: "Protected Areas"
        };
        // Set panels as a group
        this.panelState = {
            subscribeHidden: true,
            validateHidden: true,
            searchHidden: true,
            layerHidden: true,
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
            advancedOptions: false,
            showComposite: false,
            compositeParams: {},
            imageDates: [],
            selectedDate: false,
            selectedRegion: false,
            featureNames: {},
            subList: [],
            // reload limit for layers that could not be loaded
            reloadCount: 0,
            theMap: null
        };
    }

    // set up parameters after components are mounted
    componentDidMount() {
        this.getFeatureNames();
        this.initMap();
        this.getImageDates();
    }

    /// State update

    togglePanel = panelKey => this.setState({
        ...this.panelState,
        ...this.advancedPanelState,
        [panelKey]: !this.state[panelKey]
    });

    toggleShowComposite = () => this.setState({showComposite: !this.state.showComposite});

    updateSubList = list => this.setState({subList: list});

    selectDate = newDate => {
        let tileURL;
        if (this.state.showComposite) {
            // This should be unreachable
            const probvals = this.probSlider
                .getValue()
                .split(",")
                .map(val => parseInt(val));
            const yearvals = this.yearSlider.getValue().split(",");
            this.setState({
                selectedDate: false,
                compositeParams: {
                    minProbability: probvals[0],
                    maxProbability: probvals[1],
                    minYear: yearvals[0],
                    maxYear: yearvals[1]
                }
            });
            tileURL = this.URLS.COMPOSITE_IMAGE
                + "?minp="
                + this.sate.compositeParams.minProbability
                + "&maxp="
                + this.sate.compositeParams.maxProbability
                + "&miny="
                + this.sate.compositeParams.minYear
                + "&maxy="
                + this.sate.compositeParams.maxYear;
        } else {
            this.setState({selectedDate: newDate});
            tileURL = this.URLS.SINGLE_IMAGE + "?id=" + newDate;
        }
        this.updateEELayer(tileURL);
    };

    selectRegion = (level, name) => this.setState({selectedRegion: [level, name]});

    /// Fetch calls

    getGEELayers = list => {
        const name = list.shift();
        // TODO make one fetch call for all layer names
        fetch(this.URLS.GEE_LAYER + "?name=" + name)
            .then(res => res.json())
            .then(result => {
                const style = this.state.theMap.getStyle();
                style.sources[name].tiles = [result.url];
                this.state.theMap.setStyle(style);
                if (list.length > 0) this.getGEELayers(list);
            })
            .catch(error => console.log(error));
    };

    updateEELayer = tileURL => {
        fetch(tileURL)
            .then(res => res.json())
            .then(result => {
                const style = this.state.theMap.getStyle();
                const layers = style.layers;
                const layerIdx = layers.findIndex(l => l.id === "eeLayer");
                const layer = layers.find(l => l.id === "eeLayer");
                style.sources.eeLayer.tiles = [result.url];
                style.layers[layerIdx] = {...layer, layout: {visibility: "visible"}};
                this.state.theMap.setStyle(style);
            })
            .catch(error => console.log(error));
    };

    getImageDates = () => {
        fetch(this.URLS.IMG_DATES)
            .then(res => res.json())
            .then(result => {
                result.ids.sort();
                result.ids.reverse();
                this.setState({
                    imageDates: result.ids,
                    selectedDate: result.ids[0]
                });
                this.updateEELayer(this.URLS.SINGLE_IMAGE + "?id=" + result.ids[0]);
            })
            .catch(error => console.log(error));
    };

    getFeatureNames = () => {
        const url = this.URLS.FEATURE_NAMES;
        fetch(url)
            .then(res => res.json())
            .then(result => {
                if (result.action === "FeatureNames") this.setState({featureNames: result.features});
            })
            .catch(error => console.log(error));
    };

    /// Mapbox TODO move to separate component

    initMap = () => {
        const theMap = new mapboxgl.Map({
            container: "mapbox",
            style: "mapbox://styles/mapbox/satellite-streets-v9",
            center: [-73.5609339, 4.6371205],
            zoom: 5
        });
        this.setState({theMap});

        theMap.on("load", () => {
            theMap.addControl(new mapboxgl.NavigationControl({showCompass: false}));

            const layerNames = Object.keys(this.availableLayers);
            // these are launched async it only works because the fetch command takes longer than creating a layer
            this.addLayerSources(layerNames);
            this.getGEELayers(layerNames.slice(1));

            theMap.on("mousemove", e => {
                const lat = toPrecision(e.lngLat.lat, 4);
                const lng = toPrecision(e.lngLat.lng, 4);
                const hudShell = document.getElementById("lnglathud-shell");
                const hud = document.getElementById("lnglathud");
                hudShell.style.display = "inherit";
                hud.innerHTML = [lat, lng].join(", ");
            });
            theMap.on("mouseout", () => {
                const hudShell = document.getElementById("lnglathud-shell");
                hudShell.style.display = "none";
            });
            theMap.on("click", e => {
                const {lat, lng} = e.lngLat;

                const popup = new mapboxgl.Popup({closeOnClick: true})
                    .setLngLat([lng, lat])
                    .setHTML("<p>Loading...<p>")
                    .addTo(theMap);

                const visible = layerNames.map(l => this.isLayerVisible(l) && l).filter(l => l);

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
                              date: this.state.selectedDate,
                              minp: this.state.compositeParams.minProbability,
                              maxp: this.state.compositeParams.maxProbability,
                              miny: this.state.compositeParams.minYear,
                              maxy: this.state.compositeParams.maxYear,
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
                                eeLayer,
                                municipalBounds,
                                protectedAreas,
                                otherAuthorizations,
                                legalMines,
                                tierrasDeCom,
                                resguardos
                            } = resp.value;
                            if (this.isLayerVisible("eeLayer")) {
                                const cl = eeLayer ? "Detected" : "Not Detected";
                                innerHTML += `<b>Mining Activity</b>: ${cl}<br/>`;
                            }
                            if (this.isLayerVisible("municipalBounds")) {
                                const loc = municipalBounds || "Outside Region of Interest";
                                innerHTML += `<b>Located In</b>: ${loc}<br/>`;
                            }
                            if (this.isLayerVisible("protectedAreas") && protectedAreas[0]) {
                                const pa = `Category: ${protectedAreas[0]} <br/> Name: ${protectedAreas[1]}`;
                                innerHTML += `<b>Protected Area:</b><br> ${pa}<br/>`;
                            }
                            // if(this.isLayerVisible("protectedAreas") && resp.value[5]){
                            //   innerHTML += `<b>National Park:</b> ${resp.value[5]} <br/>`
                            // }
                            if (this.isLayerVisible("otherAuthorizations") && otherAuthorizations) {
                                innerHTML += `<b>Other Authorizations:</b> ${otherAuthorizations} <br/>`;
                            }
                            if (this.isLayerVisible("legalMines") && legalMines) {
                                innerHTML += `<b>Legal Mine:</b> ${legalMines} <br/>`;
                            }
                            if (this.isLayerVisible("tierrasDeCom") && tierrasDeCom) {
                                innerHTML += `<b>Ethnic Territories I:</b> ${tierrasDeCom} <br/>`;
                            }
                            if (this.isLayerVisible("resguardos") && resguardos) {
                                innerHTML += `<b>Ethnic Territories II:</b> ${resguardos} <br/>`;
                            }
                        }
                        popup.setHTML(innerHTML);
                    })
                    .catch(err => console.log(err));
            });
        });
    };

    fitMap = (type, arg) => {
        if (type === "point") {
            try {
                this.state.theMap.flyTo({center: arg, essential: true});
            } catch (err) {
                console.log("Please enter valid coordinates.");
            }
        } else if (type === "bbox") {
            try {
                this.state.theMap.fitBounds(arg);
            } catch (error) {
                console.log("Please enter valid bounds.");
            }
        }
    };

    isLayerVisible = layer => this.state.theMap.getLayer(layer).visibility === "visible";

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
        return (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    margin: 0,
                    padding: 0
                }}
            >
                <div id="mapbox"/>

                <div className="sidebar">
                    <div className="sidebar-icon gold-drop app-icon"/>
                    {/* Subscribe */}
                    <SideIcon
                        clickHandler={() => this.togglePanel("subscribeHidden")}
                        icon="envelope"
                        parentClass={this.state.subscribeHidden ? "" : "active-icon"}
                        tooltip="Subscribe"
                    />
                    <SubscribePanel
                        isHidden={this.state.subscribeHidden}
                        selectedRegion={this.state.selectedRegion}
                        subList={this.state.subList}
                        updateSubList={this.updateSubList}
                    />

                    {/* Validation */}
                    <SideIcon
                        clickHandler={() => this.togglePanel("validateHidden")}
                        icon="check"
                        parentClass={this.state.validateHidden ? "" : "active-icon"}
                        tooltip="Validate"
                    />
                    <ValidatePanel
                        featureNames={this.state.featureNames}
                        isHidden={this.state.validateHidden}
                        selectedDate={this.state.selectedDate}
                        subList={this.state.subList}
                    />

                    {/* Geo location Search */}
                    <SideIcon
                        clickHandler={() => this.togglePanel("searchHidden")}
                        icon="search"
                        parentClass={this.state.searchHidden ? "" : "active-icon"}
                        tooltip="Search"
                    />
                    <SearchPanel
                        featureNames={this.state.featureNames}
                        fitMap={this.fitMap}
                        isHidden={this.state.searchHidden}
                        selectRegion={this.selectRegion}
                    />

                    {/* Layers */}
                    <SideIcon
                        clickHandler={() => this.togglePanel("layerHidden")}
                        icon="layer"
                        parentClass={this.state.layerHidden ? "" : "active-icon"}
                        tooltip="Layers"
                    />
                    <LayerPanel
                        availableLayers={this.availableLayers}
                        isHidden={this.state.layerHidden}
                        startVisible={["eeLayer"]}
                        theMap={this.state.theMap}
                    />

                    {/* Advanced Button */}
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
                        subtext="Advanced"
                        tooltip="Advanced"
                    />
                    {this.state.advancedOptions && (
                        <React.Fragment>
                            {/* Stats graphs */}
                            <SideIcon
                                clickHandler={() => this.togglePanel("statsHidden")}
                                icon="stats"
                                parentClass={this.state.statsHidden ? "" : "active-icon"}
                                tooltip="Stats"
                            />
                            <StatsPanel
                                isHidden={this.state.statsHidden}
                                selectedDate={this.state.selectedDate}
                                subList={this.state.subList}
                            />

                            {/* Date filter */}
                            <SideIcon
                                clickHandler={() => this.togglePanel("slidersHidden")}
                                icon="filter"
                                parentClass={this.state.slidersHidden ? "" : "active-icon"}
                                tooltip="Sliders"
                            />
                            <FilterPanel
                                imageDates={this.state.imageDates}
                                isHidden={this.state.slidersHidden}
                                selectDate={this.selectDate}
                                selectedDate={this.state.selectedDate}
                                showComposite={this.state.showComposite}
                                toggleShowComposite={this.toggleShowComposite}
                            />

                            {/* Download */}
                            <SideIcon
                                clickHandler={() => this.togglePanel("downloadHidden")}
                                icon="download"
                                parentClass={this.state.downloadHidden ? "" : "active-icon"}
                                tooltip="Download data"
                            />
                            <DownloadPanel
                                isHidden={this.state.downloadHidden}
                                selectedDate={this.state.selectedDate}
                                selectedRegion={this.state.selectedRegion}
                            />
                        </React.Fragment>
                    )}

                    {/* Info dialoge */}
                    <SideIcon
                        clickHandler={() => this.togglePanel("appInfoHidden")}
                        icon="info"
                        parentClass="disclaimer"
                        tooltip="App Info"
                    />
                    <AppInfo
                        isHidden={this.state.appInfoHidden}
                        onOuterClick={() => this.togglePanel("appInfoHidden")}
                    />
                </div>
                <div id="lnglathud-shell">
                    <span id="lnglathud"/>
                </div>
            </div>
        );
    }
}

const props = {
    minProbability: 0,
    maxProbability: 100,
    minYear: 2000,
    maxYear: 2019
};

ReactDOM.render(<Home {...props}/>, document.getElementById("main-container"));
