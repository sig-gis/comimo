import React from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {toPrecision, jsonRequest} from "../utils";
import {mapboxToken} from "../appConfig";
import InfoPopupContent from "./InfoPopupContent";
import ReportPopupContent from "./ReportPopupContent";
import {MainContext, URLS, availableLayers, startVisible} from "./constants";

export default class HomeMap extends React.Component {
  // set up class flags so each component update doesn't do redundant JS tasks
  constructor(props) {
    super(props);

    this.state = {
      thePopup: null
    };
  }

  /// Lifecycle Functions ///

  componentDidMount() {
    this.initMap();
  }

  componentDidUpdate(prevProps, _prevState) {
    if (this.props.theMap && prevProps.myHeight !== this.props.myHeight) {
      setTimeout(() => this.props.theMap.resize(), 50);
    }

    if (this.state.thePopup && prevProps.reportHidden !== this.props.reportHidden) {
      this.props.setLatLon(null);
      this.state.thePopup.remove();
    }
  }

  /// API Calls ///

  setLayerUrl = (layer, url, firstTime = false) => {
    if (layer && url) {
      const {theMap} = this.props;
      const style = theMap.getStyle();
      const layers = style.layers;
      const layerIdx = layers.findIndex(l => l.id === layer);
      const thisLayer = layers[layerIdx];
      const {layout: {visibility}} = thisLayer;
      style.sources[layer].tiles = [url];
      style.layers[layerIdx] = {
        ...thisLayer,
        layout: {visibility: firstTime && startVisible.includes(layer) ? "visible" : visibility}
      };
      theMap.setStyle(style);
    } else {
      console.error("Error loading layer: ", layer, url);
    }
  };

  getGEELayers = list => {
    list.forEach(layer =>
      jsonRequest(URLS.GEE_LAYER, {name: layer})
        .then(url => this.setLayerUrl(layer, url, true))
        .catch(error => console.error(error)));
  };

  updateEELayers = (firstTime = false) => {
    const eeLayers = ["nMines", "pMines", "cMines"];
    const {selectedDates} = this.props;
    eeLayers.forEach(eeLayer => {
      jsonRequest(URLS.SINGLE_IMAGE, {id: selectedDates[eeLayer], type: eeLayer})
        .then(url => this.setLayerUrl(eeLayer, url, firstTime))
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
    this.props.setMap(theMap);

    theMap.on("load", () => {
      theMap.addControl(new mapboxgl.NavigationControl({showCompass: false}));

      // This is not safe, updateEELayer could be called before the options are returned
      this.addLayerSources([...availableLayers].reverse());
      this.getGEELayers(availableLayers.slice(3));
      this.updateEELayers(true);

      theMap.on("mousemove", e => {
        const lat = toPrecision(e.lngLat.lat, 4);
        const lng = toPrecision(e.lngLat.lng, 4);
        const hudShell = document.getElementById("lnglathud-shell");
        const hud = document.getElementById("lnglathud");
        hudShell.style.display = "inherit";
        hud.innerHTML = lat + ", " + lng;
      });
      theMap.on("click", e => {
        const {lng, lat} = e.lngLat;
        this.addPopup(lat, lng);
      });
    });
  };

  addPopup = (lat, lon) => {
    const {thePopup} = this.state;
    const {theMap, selectedDates, reportPopup, setLatLon} = this.props;
    const {localeText: {home}, localeText} = this.context;

    // Remove old popup
    if (thePopup) thePopup.remove();

    const divId = Date.now();
    const popup = new mapboxgl.Popup()
      .setLngLat([lon, lat])
      .setHTML(`<div id="${divId}"></div>`)
      .addTo(theMap);
    this.setState({thePopup: popup});
    if (reportPopup) {
      setLatLon([lat, lon]);
      ReactDOM.render(
        <ReportPopupContent
          lat={lat}
          localeText={localeText}
          lon={lon}
        />, document.getElementById(divId)
      );
    } else {
      const visibleLayers = availableLayers.map(l => this.isLayerVisible(l) && l).filter(l => l);
      ReactDOM.render(
        <InfoPopupContent
          lat={lat}
          localeText={home}
          lon={lon}
          selectedDates={selectedDates}
          visibleLayers={visibleLayers}
        />, document.getElementById(divId)
      );
    }
  };

  fitMap = (type, arg) => {
    const {localeText: {home}} = this.state;
    const {theMap} = this.props;
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

  isLayerVisible = layer => this.props.theMap.getLayer(layer).visibility === "visible";

  // Adds layers initially with no styling, URL is updated later.  This is to guarantee z order in mapbox
  addLayerSources = list => {
    const {theMap} = this.props;
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

  render() {
    return (
      <>
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
        <div id="lnglathud-shell">
          <span id="lnglathud"/>
        </div>
      </>
    );
  }
}
HomeMap.contextType = MainContext;
