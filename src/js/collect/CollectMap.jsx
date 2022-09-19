import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";
import extent from "turf-extent";
import styled from "@emotion/styled";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAtom, useAtomValue, atom } from "jotai";
import { currentPlotNumberAtom } from "../collect";

// TODO: rename this to a generic name
import { homeMapAtom as collectMapAtom } from "../home/HomeMap";

import { extraMapParamsAtom } from "../home";
import { mapboxTokenAtom } from "../components/PageLayout";
import LatLngHud from "../components/LatLngHud";

import { jsonRequest, toPrecision } from "../utils";
import { attributions, THEME, URLS } from "../constants";

// export const collectMapAtom = atom(null);

export default function CollectMap({ boundary, projectPlots, goToPlot, currentPlot }) {
  const [collectMap, setCollectMap] = useAtom(collectMapAtom);
  const [mouseCoords, setMouseCoords] = useState(null);
  const mapboxToken = useAtomValue(mapboxTokenAtom);
  const extraMapParams = useAtomValue(extraMapParamsAtom);
  const [currentPlotNumber, setCurrentPlotNumber] = useAtom(currentPlotNumberAtom);

  const [mapIsLoaded, setMapIsLoaded] = useState(false);

  const [lng, _setLng] = useState(-73.5609339);
  const [lat, _setLat] = useState(4.6371205);
  const [zoom, _setZoom] = useState(5);

  const mapContainer = useRef(null);

  // TODO duplicate?
  const isLayerVisible = (layer) => collectMap.getLayer(layer).visibility === "visible";

  const mapOnLoad = (map) => {
    addLayerSources(map, ["NICFI"]);
    map.resize();
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
    map.on("mousemove", (e) => {
      const lat = toPrecision(e.lngLat.lat, 4);
      const lng = toPrecision(e.lngLat.lng, 4);
      setMouseCoords({ lat, lng });
    });
    setMapIsLoaded(true);
  };

  useEffect(() => {
    if (!collectMap && mapboxToken !== "") {
      mapboxgl.accessToken = mapboxToken;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v9",
        center: [lng, lat],
        zoom: zoom,
      });
      map.on("load", () => mapOnLoad(map));
      setCollectMap(map);
    }
  }, [mapboxToken, boundary]);

  useEffect(() => {
    if (collectMap && Object.keys(extraMapParams).length > 0 && extraMapParams.NICFI.dataLayer) {
      collectMap && mapIsLoaded && onDataGetLayers(extraMapParams);
    }
  }, [collectMap, mapIsLoaded, extraMapParams]);

  useEffect(() => {
    if (collectMap && mapIsLoaded && boundary) {
      addPlots();
      addBoundary();
    }
  }, [collectMap, projectPlots, boundary, mapIsLoaded]);

  const onDataGetLayers = (extraMapParams) => {
    for (const layer of Object.keys(extraMapParams)) {
      getLayerUrl(layer);
    }
  }

  const addLayerSources = (map, list) => {
    list.forEach((name) => {
      map.addSource(name, {
        type: "raster",
        tiles: [],
        tileSize: 256,
        vis: { palette: [] },
        ...(attributions[name] && { attribution: attributions[name] }),
      });
      map.addLayer({
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

  const addIndividualPlotSources = () => {
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
        geometry: { type: "Point", coordinates: [p.lat, p.lng] },
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
      collectMap.on("click", p.id + "plotLabel", (e) => {
        setCurrentPlotNumber(number);
        goToPlot(number);
      });
    });
  };

  const updateVisiblePlot = () => {
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

    const fullUrl =
      params == null
        ? url
        : url +
        Object.entries(params)
          .map(([k, v]) => `&${k}=${v}`)
          .join("");

    setLayerUrl(layer, fullUrl);
  };

  return (
    <>
      <MapBoxWrapper ref={mapContainer} id="mapbox" />
      {mouseCoords && <LatLngHud mouseCoords={mouseCoords} />}
    </>
  );
}

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
