import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import extent from "turf-extent";
import styled from "@emotion/styled";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtom, useAtomValue } from "jotai";

// TODO: rename this to a generic name
import { homeMapAtom } from "../home/HomeMap";
import { extraMapParamsAtom } from "../home";
import { mapboxTokenAtom } from "../components/PageLayout";

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

export default function CollectMap({ boundary, projectPlots, goToPlot, currentPlot }) {
  const [collectMap, setHomeMap] = useAtom(homeMapAtom);
  const [mouseCoords, setMouseCoords] = useState(null);
  const mapboxToken = useAtomValue(mapboxTokenAtom);
  const extraMapParams = useAtomValue(extraMapParamsAtom);

  const [lng, setLng] = useState(-73.5609339);
  const [lat, setLat] = useState(4.6371205);
  const [zoom, setZoom] = useState(5);

  const mapContainer = useRef(null);

  // TODO duplicate?
  const isLayerVisible = (layer) => collectMap.getLayer(layer).visibility === "visible";

  // console.log("geometry", boundary);

  useEffect(() => {
    if (!collectMap && mapboxToken !== "") {
      mapboxgl.accessToken = mapboxToken;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v9",
        center: [lng, lat],
        zoom: zoom,
      });

      map.on("load", () => {
        addLayerSources(map, ["NICFI"]);
        map.resize();

        // Add layers first in the

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
        map.on("mousemove", (e) => {
          const lat = toPrecision(e.lngLat.lat, 4);
          const lng = toPrecision(e.lngLat.lng, 4);
          setMouseCoords({ lat, lng });
        });
      });

      // TODO!: Figure this out..

      // getLayerUrl(map, availableLayers.slice(3), selectedDates, extraMapParams);

      setHomeMap(map);
    }
  }, [mapboxToken, boundary]);

  useEffect(() => {
    collectMap && Object.keys(extraMapParams).length > 0 && getLayerUrl("NICFI");
  }, [collectMap, extraMapParams]);

  // const mapOnClick = (e) => {
  //   addPopup(
  //     homeMap,
  //     e.lngLat,
  //     mapPopup,
  //     visiblePanel,
  //     selectedDates,
  //     setMapPopup,
  //     setSelectedLatLng
  //   );
  // MAP functions

  // TODO do we need map argument?
  // TODO we need the NICFI layer below the MapBox plot layer
  // Adds layers initially with no styling, URL is updated later. This is to guarantee z-index order in mapbox
  const addLayerSources = (collectMap, list) => {
    list.forEach((name) => {
      collectMap.addSource(name, {
        type: "raster",
        tiles: [],
        tileSize: 256,
        vis: { palette: [] },
        ...(attributions[name] && { attribution: attributions[name] }),
      });
      collectMap.addLayer({
        id: name,
        type: "raster",
        source: name,
        minzoom: 0,
        maxzoom: 22,
        layout: { visibility: "none" },
      });
    });
  };

  const fitMap = (type, arg) => {
    if (type === "point") {
      try {
        collectMap.flyTo({ center: arg, essential: true });
      } catch (err) {
        console.error(err);
      }
    } else if (type === "bbox") {
      try {
        collectMap.fitBounds(arg, { padding: { top: 16, bottom: 94, left: 16, right: 16 } });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const addBoundary = () => {
    const geoJSON = {
      type: "Feature",
      geometry: boundary,
    };
    collectMap.addSource("boundary", {
      type: "geojson",
      data: geoJSON,
    });
    // Layer for the single large boundary that holds all individual plots
    collectMap.addLayer({
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
    fitMap("bbox", extent(geoJSON));
  };

  useEffect(() => {
    collectMap &&
      boundary &&
      collectMap.on("load", () => {
        addBoundary();
      });
  }, [collectMap, boundary]);

  const plotColor = (answer) =>
    answer === "Mina"
      ? THEME.mina.background
      : answer === "No Mina"
      ? THEME.noMina.background
      : THEME.map.unanswered;

  const addPlots = () => {
    // Helper function to add plot sources
    addIndividualPlotSources();
    // Helper function to add plot layers
    addIndividualPlotLayers();
  };

  const addIndividualPlotSources = (plots) => {
    // MapBox data and source for the indivudal plots
    const plotsGeoJSON = {
      type: "FeatureCollection",
      features: projectPlots.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: p.geom,
      })),
    };
    collectMap.addSource("plots", {
      type: "geojson",
      data: plotsGeoJSON,
    });

    const plotLabelsGeoJSON = {
      type: "FeatureCollection",
      features: projectPlots.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: { type: "Point", coordinates: [p.lat, p.lon] },
      })),
    };
    collectMap.addSource("plotLabels", {
      type: "geojson",
      data: plotLabelsGeoJSON,
    });
  };

  const addIndividualPlotLayers = () => {
    const shiftId = projectPlots[0]?.id;
    // NOTE: We use a forEach loop here instead of just one call to addLayer so that
    // we can update the color of each individual plot/plotLabel when we change the mine/no mine answer.
    // See the updateVisiblePlot for where we do these updates
    projectPlots.forEach((p) => {
      const number = p.id - shiftId + 1;
      const color = plotColor(p.answer);

      // Add each individual plot label
      collectMap.addLayer({
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
      collectMap.addLayer({
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
      collectMap.on("click", p.id + "", (e) => {
        goToPlot(number);
      });
    });
  };

  useEffect(() => {
    collectMap && addPlots();
  }, [projectPlots.length]);

  const updateVisiblePlot = (map) => {
    const { geom, id, answer } = currentPlot;
    if (geom) {
      // Set new color
      collectMap.setPaintProperty(id + "", "line-color", plotColor(answer));
      collectMap.setPaintProperty(id + "plotLabel", "text-color", plotColor(answer));
      collectMap.setPaintProperty(id + "", "line-width", 6);
      fitMap("bbox", extent(geom));
    }
  };

  useEffect(() => {
    collectMap && updateVisiblePlot(collectMap);
  }, [currentPlot]);

  // const getLayerUrl = (list) => {
  //   list.forEach((layer) => {
  //     const url = (async () => await jsonRequest(URLS.GET_IMAGE_URL, { type: layer }))().catch(
  //       console.error
  //     );

  //     // As written the URL provided must already include ? and one param so &nextParam works.
  //     const params = extraMapParams[layer];
  //     const fullUrl =
  //       params == null
  //         ? url
  //         : url +
  //           Object.entries(params)
  //             .map(([k, v]) => `&${k}=${v}`)
  //             .join("");
  //     setLayerUrl(layer, fullUrl);
  //   });
  // };

  const setLayerUrl = (layer, url) => {
    if (collectMap && layer && url && url !== "") {
      const style = collectMap.getStyle();
      const layers = style.layers;
      const layerIdx = layers.findIndex((l) => l.id === layer);
      const thisLayer = layers[layerIdx];
      style.sources[layer].tiles = [url];
      style.layers[layerIdx] = {
        ...thisLayer,
        layout: { visibility: "visible" },
      };
      collectMap.setStyle(style);
    } else {
      console.error("Error loading layer: ", layer, url);
    }
  };

  const getLayerUrl = async (layer) => {
    const url = await jsonRequest(URLS.GET_IMAGE_URL, { type: layer }).catch(console.error);
    const params = extraMapParams[layer];
    // console.log("extraMapParams", extraMapParams);
    // console.log("params", params);

    const fullUrl =
      params == null
        ? url
        : url +
          Object.entries(params)
            .map(([k, v]) => `&${k}=${v}`)
            .join("");

    // console.log("layer: ", layer);
    // console.log("fullurl", fullUrl);
    // console.log("url", url);

    setLayerUrl(layer, fullUrl);
  };

  useEffect(() => {
    if (collectMap && Object.keys(extraMapParams).length > 0) {
      for (const layer of Object.keys(extraMapParams)) {
        getLayerUrl(layer);
      }
    }
  }, [collectMap, extraMapParams]);

  return (
    <>
      <MapBoxWrapper ref={mapContainer} id="mapbox" />
      {mouseCoords && <LatLngHud mouseCoords={mouseCoords} />}
    </>
  );
}

// export default class CollectMap extends React.Component {
// constructor(props) {
//   super(props);
//   this.state = {
//     mouseCoords: null,
//     collectMap: null,
//   };
// }
/// Lifecycle Functions ///
// const mapOnClick = (e) => {
//   addPopup(
//     homeMap,
//     e.lngLat,
//     mapPopup,
//     visiblePanel,
//     selectedDates,
//     setMapPopup,
//     setSelectedLatLng
//   );
// };
// componentDidMount() {
//   this.initMap();
// }
// mapChange = (prevProps, prevState, key) => {
//   const keys = isString(key) ? [key] : key;
//   return (
//     this.state.collectMap &&
//     get(this.props, keys) &&
//     (prevState.collectMap !== this.state.collectMap ||
//       get(prevProps, keys) !== get(this.props, keys))
//   );
// };
// componentDidUpdate(prevProps, prevState) {
// if (this.mapChange(prevProps, prevState, "myHeight")) {
//   setTimeout(() => this.state.collectMap.resize(), 50);
// }
// if (this.mapChange(prevProps, prevState, "boundary")) {
//   this.addBoundary();
// }
// if (this.mapChange(prevProps, prevState, ["projectPlots", "length"])) {
//   this.addPlots();
// }
// if (this.props.projectPlots && this.mapChange(prevProps, prevState, "currentPlot")) {
//   this.updateVisiblePlot();
// }
// if (
//   this.state.collectMap &&
//   Object.keys(this.props.extraParams).length > 0 &&
//   (prevState.collectMap !== this.state.collectMap ||
//     prevProps.extraParams !== this.props.extraParams)
// ) {
//   this.getLayerUrl(Object.keys(this.props.extraParams));
// }
// }
/// Mapbox ///
// setLayerUrl = (layer, url) => {
//   if (layer && url && url !== "") {
//     const { collectMap } = this.state;
//     const style = collectMap.getStyle();
//     const layers = style.layers;
//     const layerIdx = layers.findIndex((l) => l.id === layer);
//     const thisLayer = layers[layerIdx];
//     style.sources[layer].tiles = [url];
//     style.layers[layerIdx] = {
//       ...thisLayer,
//       layout: { visibility: "visible" },
//     };
//     collectMap.setStyle(style);
//   } else {
//     console.error("Error loading layer: ", layer, url);
//   }
// };
// getLayerUrl = (list) => {
//   list.forEach((layer) => {
//     jsonRequest(URLS.GET_IMAGE_URL, { type: layer })
//       .then((url) => {
//         // As written the URL provided must already include ? and one param so &nextParam works.
//         const params = this.props.extraParams[layer];
//         const fullUrl =
//           params == null
//             ? url
//             : url +
//               Object.entries(params)
//                 .map(([k, v]) => `&${k}=${v}`)
//                 .join("");
//         this.setLayerUrl(layer, fullUrl);
//       })
//       .catch((error) => console.error(error));
//   });
// };
// initMap = () => {
//   mapboxgl.accessToken = this.props.mapboxToken;
//   const collectMap = new mapboxgl.Map({
//     container: "mapbox",
//     style: "mapbox://styles/mapbox/satellite-streets-v9",
//     center: [-73.5609339, 4.6371205],
//     zoom: 5,
//   });
//   setTimeout(() => collectMap.resize(), 1);
//   collectMap.on("load", () => {
//     // Add layers first in the
//     this.addLayerSources(collectMap, ["NICFI"]);
//     collectMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
//     collectMap.on("mousemove", (e) => {
//       const lat = toPrecision(e.lngLat.lat, 4);
//       const lng = toPrecision(e.lngLat.lng, 4);
//       this.setState({ mouseCoords: { lat, lng } });
//     });
//     this.setState({ collectMap });
//     this.getLayerUrl(["NICFI"]);
//   });
// };
// isLayerVisible = (layer) => this.state.collectMap.getLayer(layer).visibility === "visible";
// Adds layers initially with no styling, URL is updated later.  This is to guarantee z order in mapbox
// addLayerSources = (collectMap, list) => {
//   list.forEach((name) => {
//     collectMap.addSource(name, {
//       type: "raster",
//       tiles: [],
//       tileSize: 256,
//       vis: { palette: [] },
//       ...(attributions[name] && { attribution: attributions[name] }),
//     });
//     collectMap.addLayer({
//       id: name,
//       type: "raster",
//       source: name,
//       minzoom: 0,
//       maxzoom: 22,
//       layout: { visibility: "none" },
//     });
//   });
// };
// fitMap = (type, arg) => {
//   const { collectMap } = this.state;
//   if (type === "point") {
//     try {
//       collectMap.flyTo({ center: arg, essential: true });
//     } catch (err) {
//       console.error(err);
//     }
//   } else if (type === "bbox") {
//     try {
//       collectMap.fitBounds(arg, { padding: { top: 16, bottom: 94, left: 16, right: 16 } });
//     } catch (error) {
//       console.error(error);
//     }
//   }
// };
// addBoundary = () => {
//   const { collectMap } = this.state;
//   const { boundary } = this.props;
//   const geoJSON = {
//     type: "Feature",
//     geometry: boundary,
//   };
//   collectMap.addSource("boundary", {
//     type: "geojson",
//     data: geoJSON,
//   });
//   // Layer for the single large boundary that holds all individual plots
//   collectMap.addLayer({
//     id: "boundary",
//     type: "line",
//     source: "boundary",
//     layout: {
//       "line-join": "round",
//       "line-cap": "round",
//     },
//     paint: {
//       "line-color": THEME.map.boundary,
//       "line-width": 4,
//     },
//   });
//   this.fitMap("bbox", extent(geoJSON));
// };
// plotColor = (answer) =>
//   answer === "Mina"
//     ? THEME.mina.background
//     : answer === "No Mina"
//     ? THEME.noMina.background
//     : THEME.map.unanswered;
// addIndividualPlotLayers = () => {
//   const { projectPlots } = this.props;
//   const { goToPlot } = this.props;
//   const { collectMap } = this.state;
//   const shiftId = projectPlots[0]?.id;
//   // NOTE: We use a forEach loop here instead of just one call to addLayer so that
//   // we can update the color of each individual plot/plotLabel when we change the mine/no mine answer.
//   // See the updateVisiblePlot for where we do these updates
//   projectPlots.forEach((p) => {
//     const number = p.id - shiftId + 1;
//     const color = this.plotColor(p.answer);
//     // Add each individual plot label
//     collectMap.addLayer({
//       id: p.id + "plotLabel", // mapbox needs a string
//       type: "symbol",
//       source: "plotLabels",
//       filter: ["==", ["get", "id"], p.id],
//       layout: {
//         "text-field": "" + number,
//         "text-allow-overlap": false,
//         "text-size": 24,
//         "text-anchor": "center",
//         "text-ignore-placement": true,
//       },
//       paint: {
//         "text-color": color,
//       },
//     });
//     // Add each individual plot boundary
//     collectMap.addLayer({
//       id: p.id + "", // mapbox needs a string
//       type: "line",
//       source: "plots",
//       filter: ["==", ["get", "id"], p.id],
//       layout: {
//         "line-join": "round",
//         "line-cap": "round",
//       },
//       paint: {
//         "line-color": color,
//         "line-width": 4,
//       },
//     });
//     collectMap.on("click", p.id + "sym", (e) => {
//       goToPlot(number);
//     });
//   });
// };
// addIndividualPlotSources = (plots) => {
//   const { projectPlots } = this.props;
//   const { collectMap } = this.state;
//   // MapBox data and source for the indivudal plots
//   const plotsGeoJSON = {
//     type: "FeatureCollection",
//     features: projectPlots.map((p) => ({
//       type: "Feature",
//       properties: { id: p.id },
//       geometry: p.geom,
//     })),
//   };
//   collectMap.addSource("plots", {
//     type: "geojson",
//     data: plotsGeoJSON,
//   });
// MapBox data and source for the indivudal plotLabels
//   const plotLabelsGeoJSON = {
//     type: "FeatureCollection",
//     features: projectPlots.map((p) => ({
//       type: "Feature",
//       properties: { id: p.id },
//       geometry: { type: "Point", coordinates: [p.lat, p.lon] },
//     })),
//   };
//   collectMap.addSource("plotLabels", {
//     type: "geojson",
//     data: plotLabelsGeoJSON,
//   });
// };
// updateVisiblePlot = () => {
//   const { collectMap } = this.state;
//   const {
//     projectPlots,
//     currentPlot: { geom, id, answer },
//   } = this.props;
//   if (geom) {
//     // Set new color
//     collectMap.setPaintProperty(id + "", "line-color", this.plotColor(answer));
//     collectMap.setPaintProperty(id + "plotLabel", "text-color", this.plotColor(answer));
//     collectMap.setPaintProperty(id + "", "line-width", 6);
//     this.fitMap("bbox", extent(geom));
//   }
// };
// addPlots = () => {
//   // Helper function to add plot sources
//   this.addIndividualPlotSources();
//   // Helper function to add plot layers
//   this.addIndividualPlotLayers();
// };
// render() {
//   const { mouseCoords } = this.state;
//   return (
//     <>
//       <MapBoxWrapper id="mapbox" />
//       {mouseCoords && <LatLngHud mouseCoords={mouseCoords} />}
//     </>
//   );
// }
// }
