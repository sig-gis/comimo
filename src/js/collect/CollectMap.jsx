import React from "react";
import mapboxgl from "mapbox-gl";
import extent from "turf-extent";
import styled from "@emotion/styled";
import "mapbox-gl/dist/mapbox-gl.css";

import { get, isString } from "lodash";
import LatLngHud from "../components/LatLngHud";

import { jsonRequest, toPrecision } from "../utils";
import { attributions, THEME, URLS } from "../constants";

const MapBoxWrapper = styled.div`
  height: 100%;
  margin: 0;
  padding: 0;
  position: "relative";
  width: 100%;

  .mapboxgl-ctrl-logo {
    margin: 0px 54px !important;
  }

  @media only screen and (orientation: portrait) {
    .mapboxgl-ctrl-bottom-right {
      height: 100%;
      width: 100%;
    }
    .mapboxgl-ctrl-top-right {
      top: 50px;
    }
    .mapboxgl-ctrl-attrib {
      display: none;
    }
    .mapboxgl-ctrl-logo {
      margin: 0 0 78px 4px !important;
    }
  }
`;

export default class CollectMap extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      mouseCoords: null,
      theMap: null,
    };
  }

  /// Lifecycle Functions ///

  componentDidMount() {
    this.initMap();
  }

  mapChange = (prevProps, prevState, key) => {
    const keys = isString(key) ? [key] : key;
    return (
      this.state.theMap &&
      get(this.props, keys) &&
      (prevState.theMap !== this.state.theMap || get(prevProps, keys) !== get(this.props, keys))
    );
  };

  componentDidUpdate(prevProps, prevState) {
    if (this.mapChange(prevProps, prevState, "myHeight")) {
      setTimeout(() => this.state.theMap.resize(), 50);
    }

    if (this.mapChange(prevProps, prevState, "boundary")) {
      this.addBoundary();
    }

    if (this.mapChange(prevProps, prevState, ["projectPlots", "length"])) {
      this.addPlots();
    }

    if (this.props.projectPlots && this.mapChange(prevProps, prevState, "currentPlot")) {
      this.updateVisiblePlot();
    }

    if (
      this.state.theMap &&
      Object.keys(this.props.extraParams).length > 0 &&
      (prevState.theMap !== this.state.theMap || prevProps.extraParams !== this.props.extraParams)
    ) {
      this.getLayerUrl(Object.keys(this.props.extraParams));
    }
  }

  /// Mapbox ///

  setLayerUrl = (layer, url) => {
    if (layer && url && url !== "") {
      const { theMap } = this.state;
      const style = theMap.getStyle();
      const layers = style.layers;
      const layerIdx = layers.findIndex((l) => l.id === layer);
      const thisLayer = layers[layerIdx];
      style.sources[layer].tiles = [url];
      style.layers[layerIdx] = {
        ...thisLayer,
        layout: { visibility: "visible" },
      };

      theMap.setStyle(style);
    } else {
      console.error("Error loading layer: ", layer, url);
    }
  };

  getLayerUrl = (list) => {
    list.forEach((layer) => {
      jsonRequest(URLS.GET_IMAGE_URL, { type: layer })
        .then((url) => {
          // As written the URL provided must already include ? and one param so &nextParam works.
          const params = this.props.extraParams[layer];
          const fullUrl =
            params == null
              ? url
              : url +
                Object.entries(params)
                  .map(([k, v]) => `&${k}=${v}`)
                  .join("");
          this.setLayerUrl(layer, fullUrl);
        })
        .catch((error) => console.error(error));
    });
  };

  initMap = () => {
    mapboxgl.accessToken = this.props.mapboxToken;
    const theMap = new mapboxgl.Map({
      container: "mapbox",
      style: "mapbox://styles/mapbox/satellite-streets-v9",
      center: [-73.5609339, 4.6371205],
      zoom: 5,
    });
    setTimeout(() => theMap.resize(), 1);

    theMap.on("load", () => {
      // Add layers first in the
      this.addLayerSources(theMap, ["NICFI"]);

      theMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
      theMap.on("mousemove", (e) => {
        const lat = toPrecision(e.lngLat.lat, 4);
        const lng = toPrecision(e.lngLat.lng, 4);
        this.setState({ mouseCoords: { lat, lng } });
      });
      this.setState({ theMap });
      this.getLayerUrl(["NICFI"]);
    });
  };

  isLayerVisible = (layer) => this.state.theMap.getLayer(layer).visibility === "visible";

  // Adds layers initially with no styling, URL is updated later.  This is to guarantee z order in mapbox
  addLayerSources = (theMap, list) => {
    list.forEach((name) => {
      theMap.addSource(name, {
        type: "raster",
        tiles: [],
        tileSize: 256,
        vis: { palette: [] },
        ...(attributions[name] && { attribution: attributions[name] }),
      });
      theMap.addLayer({
        id: name,
        type: "raster",
        source: name,
        minzoom: 0,
        maxzoom: 22,
        layout: { visibility: "none" },
      });
    });
  };

  fitMap = (type, arg) => {
    const { theMap } = this.state;
    if (type === "point") {
      try {
        theMap.flyTo({ center: arg, essential: true });
      } catch (err) {
        console.error(err);
      }
    } else if (type === "bbox") {
      try {
        theMap.fitBounds(arg, { padding: { top: 16, bottom: 94, left: 16, right: 16 } });
      } catch (error) {
        console.error(error);
      }
    }
  };

  addBoundary = () => {
    const { theMap } = this.state;
    const { boundary } = this.props;
    const geoJSON = {
      type: "Feature",
      geometry: boundary,
    };
    theMap.addSource("boundary", {
      type: "geojson",
      data: geoJSON,
    });
    // Layer for the single large boundary that holds all individual plots
    theMap.addLayer({
      id: "boundary",
      type: "line",
      source: "boundary",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": THEME.map.boundary,
        "line-width": 4,
      },
    });
    this.fitMap("bbox", extent(geoJSON));
  };

  plotColor = (answer) =>
    answer === "Mina"
      ? THEME.mina.background
      : answer === "No Mina"
      ? THEME.noMina.background
      : THEME.map.unanswered;

  addIndividualPlotLayers = () => {
    const { projectPlots } = this.props;
    const { goToPlot } = this.props;
    const { theMap } = this.state;
    const shiftId = projectPlots[0]?.id;

    // NOTE: We use a forEach loop here instead of just one call to addLayer so that
    // we can update the color of each individual plot/plotLabel when we change the mine/no mine answer.
    // See the updateVisiblePlot for where we do these updates
    projectPlots.forEach((p) => {
      const number = p.id - shiftId + 1;
      const color = this.plotColor(p.answer);

      // Add each individual plot label
      theMap.addLayer({
        id: p.id + "plotLabel", // mapbox needs a string
        type: "symbol",
        source: "plotLabels",
        filter: ["==", ["get", "id"], p.id],
        layout: {
          "text-field": "" + number,
          "text-allow-overlap": false,
          "text-size": 24,
          "text-anchor": "center",
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": color,
        },
      });

      // Add each individual plot boundary
      theMap.addLayer({
        id: p.id + "", // mapbox needs a string
        type: "line",
        source: "plots",
        filter: ["==", ["get", "id"], p.id],
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": 4,
        },
      });

      theMap.on("click", p.id + "sym", (e) => {
        goToPlot(number);
      });
    });
  };

  addIndividualPlotSources = (plots) => {
    const { projectPlots } = this.props;
    const { theMap } = this.state;

    // MapBox data and source for the indivudal plots
    const plotsGeoJSON = {
      type: "FeatureCollection",
      features: projectPlots.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: p.geom,
      })),
    };
    theMap.addSource("plots", {
      type: "geojson",
      data: plotsGeoJSON,
    });

    // MapBox data and source for the indivudal plotLabels
    const plotLabelsGeoJSON = {
      type: "FeatureCollection",
      features: projectPlots.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: { type: "Point", coordinates: [p.lat, p.lon] },
      })),
    };
    theMap.addSource("plotLabels", {
      type: "geojson",
      data: plotLabelsGeoJSON,
    });
  };

  updateVisiblePlot = () => {
    const { theMap } = this.state;
    const {
      projectPlots,
      currentPlot: { geom, id, answer },
    } = this.props;
    if (geom) {
      // Set new color
      theMap.setPaintProperty(id + "", "line-color", this.plotColor(answer));
      theMap.setPaintProperty(id + "plotLabel", "text-color", this.plotColor(answer));
      theMap.setPaintProperty(id + "", "line-width", 6);
      this.fitMap("bbox", extent(geom));
    }
  };

  addPlots = () => {
    // Helper function to add plot sources
    this.addIndividualPlotSources();
    // Helper function to add plot layers
    this.addIndividualPlotLayers();
  };

  render() {
    const { mouseCoords } = this.state;
    return (
      <>
        <MapBoxWrapper id="mapbox" />
        {mouseCoords && <LatLngHud mouseCoords={mouseCoords} />}
      </>
    );
  }
}
