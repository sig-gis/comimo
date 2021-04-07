/* eslint-disable react/jsx-no-undef */
window.mobileAndTabletCheck = function () {
    let check = false;
    (function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
                a
            )
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|m-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
                a.substr(0, 4)
            )
        ) check = true;
    }(navigator.userAgent || navigator.vendor || window.opera));
    return check;
};

class Home extends React.Component {
    // set up class flags so each component update doesn't do redundant JS tasks
    constructor(props) {
        super(props);

        this.flags = {
            updatelayers: true,
            layeradded: false,
            isMobile: mobileAndTabletCheck()
        };
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

    // function to call when slider values are changed
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
        this.refreshLayers(tileURL);
    };

    selectRegion = (level, name) => this.setState({selectedRegion: [level, name]});

    /// Fetch calls

    getGEELayers = list => {
        const name = list.shift();
        fetch(this.URLS.GEE_LAYER + "?name=" + name)
            .then(res => res.json())
            .then(result => {
                try {
                    console.log(result.url);
                    this.state.theMap.getSource(name).tiles = [result.url];
                    // clear existing tile cache and force map refresh
                    this.state.theMap.style.sourceCaches[name].clearTiles();
                    this.state.theMap.style.sourceCaches[name].update(this.state.theMap.transform);
                    document.getElementsByClassName("vis-" + name)[0].style.border = "solid 1px " + result.style.color;
                    document.getElementsByClassName("vis-" + name)[0].style.background = result.style.fillColor;
                    this.state.theMap.triggerRepaint();
                    if (list.length > 0) this.getGEELayers(list);
                } catch (err) {
                    console.log(err);
                    this.setState(prevState => ({reloadCount: prevState.reloadCount + 1}));
                    if (this.state.reloadCount < 4) list.push(name);
                    if (list.length > 0) this.getGEELayers(list);
                }
            })
            .catch(error => {
                console.log(error);
                this.setState(prevState => ({reloadCount: prevState.reloadCount + 1}));
                if (this.state.reloadCount < 4) list.push(name);
                if (list.length > 0) this.getGEELayers(list);
            });
    };

    refreshLayers = tileURL => {
        fetch(tileURL)
            .then(res => res.json())
            .then(result => {
                try {
                    this.state.theMap.getSource("eeLayer").tiles = [result.url];
                    // clear existing tile cache and force map refresh
                    this.state.theMap.style.sourceCaches.eeLayer.clearTiles();
                    this.state.theMap.style.sourceCaches.eeLayer.update(this.state.theMap.transform);
                    document.getElementsByClassName("vis-eeLayer")[0].style.background = "#" + result.visparams.palette[0];
                    this.state.theMap.triggerRepaint();
                } catch (err) {
                    console.log(err);
                    setTimeout(this.refreshLayers(tileURL), 1000);
                }
            })
            .catch(error => {
                console.log(error);
                this.refreshLayers(tileURL);
            });
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
                this.refreshLayers(this.URLS.SINGLE_IMAGE + "?id=" + result.ids[0]);
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
            style: "mapbox://styles/mapbox/"
                + (this.flags.isMobile ? "dark-v10" : "satellite-streets-v9"),
            center: [-73.5609339, 4.6371205],
            zoom: 5
        });
        this.setState({theMap});

        theMap.on("load", () => {
            theMap.addControl(new mapboxgl.NavigationControl({showCompass: false}));

            this.addLayerSources([
                "eeLayer",
                "municipalBounds",
                "otherAuthorizations",
                // 'nationalParks',
                "tierrasDeCom",
                "resguardos",
                "legalMines",
                "protectedAreas"
            ]);

            this.flags.layeradded = true;
            const overlays = {
                eeLayer: "Prediction",
                municipalBounds: "Municipal Boundaries",
                legalMines: "Legal mines",
                // 'nationalParks': 'National Parks',
                otherAuthorizations: "Other Authorizations",
                tierrasDeCom: "Ethnic territories I",
                resguardos: "Ethnic territories II",
                protectedAreas: "Protected Areas"
            };
            const opacity = new OpacityControl({
                overLayers: overlays,
                visibleOverlays: ["eeLayer"],
                opacityControl: true
            });
            theMap.addControl(opacity, "bottom-right");
            this.getGEELayers([
                "municipalBounds",
                "otherAuthorizations", // 'nationalParks',
                "tierrasDeCom",
                "resguardos",
                "legalMines",
                "protectedAreas"
            ]);

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

                const visible = [
                    this.isLayerVisible("eeLayer") && "eeLayer",
                    this.isLayerVisible("municipalBounds") && "municipalBounds",
                    this.isLayerVisible("protectedAreas") && "protectedAreas",
                    this.isLayerVisible("otherAuthorizations") && "otherAuthorizations",
                    this.isLayerVisible("legalMines") && "legalMines",
                    this.isLayerVisible("tierrasDeCom") && "tierrasDeCom",
                    this.isLayerVisible("resguardos") && "resguardos"
                ].filter(layer => layer);

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
                                innerHTML += `<b>Located In</b>:${loc}<br/>`;
                            }
                            if (this.isLayerVisible("protectedAreas") && protectedAreas[0]) {
                                const pa = `Category: ${protectedAreas[0]} <br/> Name: ${protectedAreas[1]}`;
                                innerHTML += `<b>Protected Area</b><br>${pa}<br/>`;
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
        list.forEach(name => {
            this.state.theMap.addSource(name, {type: "raster", tiles: [], tileSize: 256, vis: {palette: []}});
            this.state.theMap.addLayer({
                id: name,
                type: "raster",
                source: name,
                minzoom: 0,
                maxzoom: 22
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
