import React, { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

import LngLatHud from "../components/LngLatHud";

import { MainContext } from "../components/PageLayout";
import { toPrecision, jsonRequest } from "../utils";
import { URLS, availableLayers, startVisible, attributions } from "../constants";

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
    .mapboxgl-popup-content {
      font-size: 0.75rem;
    }
    .mapboxgl-ctrl-attrib {
      display: none;
    }
    .mapboxgl-ctrl-logo {
      margin: 0 0 78px 4px !important;
    }
  }
`;

// TODO add theMap into an atom and use the same atom in home.jsx

export default function HomeMap({
  extraParams,
  mapboxToken,
  selectDates,
  selectedDates,
  setMap,
  theMap,
  addPopup,
}) {
  // Initial State
  const [thePopup, setThePopup] = useState(null);
  const [mouseCoords, setMouseCoords] = useState(null);
  const { myHeight } = useContext(MainContext);

  // Effects
  useEffect(() => {
    initMap();
  }, []);

  useEffect(() => {
    Object.keys(selectedDates).length > 0 && getLayerUrl(Object.keys(selectedDates));
  }, [theMap, selectedDates]);

  useEffect(() => {
    setTimeout(() => theMap.resize(), 50);
  }, [theMap, myHeight]);

  useEffect(() => {
    Object.keys(extraParams).length > 0 && getLayerUrl(Object.keys(extraParams));
  }, [theMap, extraParams]);

  // MapBox functions
  const setLayerUrl = (layer, url) => {
    if (layer && url && url !== "") {
      const style = theMap.getStyle();
      const layers = style.layers;
      const layerIdx = layers.findIndex((l) => l.id === layer);
      const thisLayer = layers[layerIdx];
      const {
        layout: { visibility },
      } = thisLayer;
      const noUrl = style.sources[layer].tiles.length === 0;
      style.sources[layer].tiles = [url];
      style.layers[layerIdx] = {
        ...thisLayer,
        layout: { visibility: noUrl && startVisible.includes(layer) ? "visible" : visibility },
      };
      theMap.setStyle(style);
    } else {
      console.error("Error loading layer: ", layer, url);
    }
  };

  const getLayerUrl = (list) => {
    list.forEach((layer) => {
      jsonRequest(URLS.GET_IMAGE_URL, { dataLayer: selectedDates[layer], type: layer })
        .then((url) => {
          // As written the URL provided must already include ? and one param so &nextParam works.
          const params = extraParams[layer];
          const fullUrl =
            params == null
              ? url
              : url +
                Object.entries(params)
                  .map(([k, v]) => `&${k}=${v}`)
                  .join("");
          setLayerUrl(layer, fullUrl);
        })
        .catch((error) => console.error(error));
    });
  };

  const initMap = () => {
    mapboxgl.accessToken = mapboxToken;
    const theMap = new mapboxgl.Map({
      container: "mapbox",
      style: "mapbox://styles/mapbox/satellite-streets-v9",
      center: [-73.5609339, 4.6371205],
      zoom: 5,
    });
    setTimeout(() => theMap.resize(), 1);

    theMap.on("load", () => {
      theMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

      // Add layers first in the
      addLayerSources(theMap, [...availableLayers].reverse());

      theMap.on("mousemove", (e) => {
        const lat = toPrecision(e.lngLat.lat, 4);
        const lng = toPrecision(e.lngLat.lng, 4);
        setMouseCoords({ lat, lng });
      });
      theMap.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        addPopup(lat, lng);
      });

      setMap(theMap);

      // This is a bit hard coded
      getLayerUrl(availableLayers.slice(3));
      if (Object.keys(selectedDates).length) getLayerUrl(Object.keys(selectedDates));
    });
  };

  // Adds layers initially with no styling, URL is updated later.  This is to guarantee z order in mapbox
  const addLayerSources = (theMap, list) => {
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

  // Render
  return (
    <>
      <MapBoxWrapper id="mapbox" />
      {mouseCoords && <LngLatHud mouseCoords={mouseCoords} />}
    </>
  );
}
