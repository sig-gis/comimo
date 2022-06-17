import React from "react";
import ReactDOM from "react-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styled from "styled-components";

import LngLatHud from "../components/LngLatHud";
import InfoPopupContent from "./InfoPopupContent";
import ReportPopupContent from "./ReportPopupContent";

import {URLS, availableLayers, startVisible, attributions} from "../constants";
import {toPrecision, jsonRequest} from "../utils";
import {MainContext} from "../components/PageLayout";

const MapBoxWrapper = styled.div`
  height: 100%;
  margin: 0;
  padding: 0;
  position: "relative";
  width: 100%;

  .mapboxgl-popup-close-button {
    font-size: 1.75rem;
    padding: 3px 3px 8px 8px;
    line-height: 1.25rem;
  }
  .mapboxgl-popup-content {
    padding-top: 14px;
  }
  .mapboxgl-ctrl-logo {
    margin: 0px 54px !important
  }

  @media only screen and (orientation: portrait) {
    .mapboxgl-ctrl-bottom-right {
      height: 100%;
      width: 100%;
    }
    .mapboxgl-ctrl-top-right {
      top: 50px;
    }
    .mapboxgl-popup-content {
      font-size: .75rem;
    }
    .mapboxgl-ctrl-attrib {
      display: none;
    }
    .mapboxgl-ctrl-logo {
      margin: 0 0 78px 4px !important;
    }
  }
`;

export default class HomeMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      thePopup: null,
      mouseCoords: null
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

    if (this.state.thePopup && prevProps.reportPopup && !this.props.reportPopup) {
      this.state.thePopup.remove();
    }

    if (this.props.theMap && Object.keys(this.props.selectedDates).length > 0
        && (prevProps.theMap !== this.props.theMap
          || prevProps.selectedDates !== this.props.selectedDates)) {
      this.getLayerUrl(Object.keys(this.props.selectedDates));
    }

    if (this.props.theMap && Object.keys(this.props.extraParams).length > 0
        && (prevProps.theMap !== this.props.theMap
          || prevProps.extraParams !== this.props.extraParams)) {
      this.getLayerUrl(Object.keys(this.props.extraParams));
    }
  }

  /// Mapbox ///

  setLayerUrl = (layer, url) => {
    if (layer && url && url !== "") {
      const {theMap} = this.props;
      const style = theMap.getStyle();
      const layers = style.layers;
      const layerIdx = layers.findIndex(l => l.id === layer);
      const thisLayer = layers[layerIdx];
      const {layout: {visibility}} = thisLayer;
      const noUrl = style.sources[layer].tiles.length === 0;
      style.sources[layer].tiles = [url];
      style.layers[layerIdx] = {
        ...thisLayer,
        layout: {visibility: noUrl && startVisible.includes(layer) ? "visible" : visibility}
      };
      theMap.setStyle(style);
    } else {
      console.error("Error loading layer: ", layer, url);
    }
  };

  getLayerUrl = list => {
    const {selectedDates} = this.props;
    list.forEach(layer => {
      jsonRequest(URLS.GET_IMAGE_URL, {dataLayer: selectedDates[layer], type: layer})
        .then(url => {
          // As written the URL provided must already include ? and one param so &nextParam works.
          const params = this.props.extraParams[layer];
          const fullUrl = params == null
            ? url
            : url + Object.entries(params)
              .map(([k, v]) => `&${k}=${v}`)
              .join("");
          this.setLayerUrl(layer, fullUrl);
        })
        .catch(error => console.error(error));
    });
  };

  initMap = () => {
    const {selectedDates, mapboxToken} = this.props;
    mapboxgl.accessToken = mapboxToken;
    const theMap = new mapboxgl.Map({
      container: "mapbox",
      style: "mapbox://styles/mapbox/satellite-streets-v9",
      center: [-73.5609339, 4.6371205],
      zoom: 5
    });
    setTimeout(() => theMap.resize(), 1);

    theMap.on("load", () => {
      theMap.addControl(new mapboxgl.NavigationControl({showCompass: false}));

      // Add layers first in the
      this.addLayerSources(theMap, [...availableLayers].reverse());

      theMap.on("mousemove", e => {
        const lat = toPrecision(e.lngLat.lat, 4);
        const lng = toPrecision(e.lngLat.lng, 4);
        this.setState({mouseCoords: {lat, lng}});
      });
      theMap.on("click", e => {
        const {lng, lat} = e.lngLat;
        this.addPopup(lat, lng);
      });

      this.props.setMap(theMap);
      // This is a bit hard coded
      this.getLayerUrl(availableLayers.slice(3));
      if (Object.keys(selectedDates).length) this.getLayerUrl(Object.keys(selectedDates));
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

    setLatLon([lat, lon]);

    if (reportPopup) {
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

  isLayerVisible = layer => this.props.theMap.getLayer(layer).visibility === "visible";

  // Adds layers initially with no styling, URL is updated later.  This is to guarantee z order in mapbox
  addLayerSources = (theMap, list) => {
    list.forEach(name => {
      theMap.addSource(
        name,
        {
          type: "raster",
          tiles: [],
          tileSize: 256,
          vis: {palette: []},
          ...attributions[name] && {attribution: attributions[name]}
        }
      );
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
    const {mouseCoords} = this.state;
    return (
      <>
        <MapBoxWrapper id="mapbox"/>
        {mouseCoords && <LngLatHud mouseCoords={mouseCoords}/>}
      </>
    );
  }
}
HomeMap.contextType = MainContext;
