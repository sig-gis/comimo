import React, { useContext, useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { atom, useAtom } from "jotai";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

import LngLatHud from "../components/LngLatHud";
import ReportPopupContent from "./ReportPopupContent";
import InfoPopupContent from "./InfoPopupContent";
import { MainContext } from "../components/PageLayout";

import { selectedDatesAtom } from "../home";

import { toPrecision, jsonRequest } from "../utils";
import { URLS, availableLayers, startVisible, attributions } from "../constants";

export const mapAtom = atom(null);
export const mapPopupAtom = atom(null);
export const selectedLngLatAtom = atom([]);

export default function HomeMap({
  map,
  extraParams,
  mapboxToken,
  visiblePanel,
  selectedDates,
  selectDate,
}) {
  // Initial State
  const [mouseCoords, setMouseCoords] = useState(null);
  const [mapPopup, setMapPopup] = useAtom(mapPopupAtom);
  const [selectedLngLat, setSelectedLngLat] = useAtom(selectedLngLatAtom);
  const { localeText, myHeight } = useContext(MainContext);
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(-73.5609339);
  const [lat, setLat] = useState(4.6371205);
  const [zoom, setZoom] = useState(5);

  // Effects
  useEffect(() => {
    if (map.current) return; // initialize map only once
    mapboxgl.accessToken = mapboxToken;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v9",
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on("load", () => {
      map.current.resize();

      // Add layers first in the
      addLayerSources(map.current, [...availableLayers].reverse());
      map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
      map.current.on("mousemove", (e) => {
        const lng = toPrecision(e.lngLat.lng, 4);
        const lat = toPrecision(e.lngLat.lat, 4);
        setMouseCoords({ lng, lat });
      });
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        setSelectedLngLat([lng, lat]);
        setMapPopup(addPopup(map.current, lng, lat, visiblePanel, mapPopup, localeText));
      });

      // This is a bit hard coded
      if (selectedDates) {
        getLayerUrl(map.current, availableLayers.slice(3), selectedDates, extraParams);
        if (Object.keys(selectedDates).length)
          getLayerUrl(map, Object.keys(selectedDates), selectedDates, extraParams);
      }
    });
  }, []);

  useEffect(() => {
    if (map.current && selectedDates) {
      Object.keys(selectedDates).length > 0 &&
        getLayerUrl(map.current, Object.keys(selectedDates), selectedDates, extraParams);
    }
  }, [selectedDates]);

  useEffect(() => {
    console.log("_printing extraparams: ", extraParams);
    if (map.current && selectedDates) {
      Object.keys(extraParams).length > 0 &&
        getLayerUrl(map.current, Object.keys(extraParams), selectedDates, extraParams);
    }
  }, [extraParams]);

  // useEffect(() => {
  //   map.current && setTimeout(() => map.current.resize(), 50);
  // }, [myHeight]);

  // Adds layers initially with no styling, URL is updated later.  This is to guarantee z order in mapbox
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

  // Render

  return (
    <>
      <MapBoxWrapper ref={mapContainer} id="mapbox" />
      {mouseCoords && <LngLatHud mouseCoords={mouseCoords} />}
    </>
  );
}

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

const addPopup = (map, lng, lat, visiblePanel, mapPopup, localeText) => {
  // Remove old popup
  if (mapPopup) mapPopup.remove();

  const divId = Date.now();
  const popup = new mapboxgl.Popup()
    .setLngLat([lng, lat])
    .setHTML(`<div id="${divId}"></div>`)
    .addTo(map);

  // TODO: visiblePanel may not be needed when switching to Footer
  if (visiblePanel === "report") {
    ReactDOM.render(
      <ReportPopupContent lat={lat} localeText={localeText} lon={lng} />,
      document.getElementById(divId)
    );
  } else {
    ReactDOM.render(
      <InfoPopupContent map={map} lng={lng} lat={lat} localeText={localeText} />,
      document.getElementById(divId)
    );
  }
  return popup;
};

const setLayerUrl = (map, layer, url) => {
  if (layer && url && url !== "") {
    const style = map.getStyle();
    const layers = style.layers;
    const layerIdx = layers.findIndex((l) => l.id === layer);
    const thisLayer = layers[layerIdx];
    if (thisLayer) {
      const {
        layout: { visibility },
      } = thisLayer;
      const noUrl = style.sources[layer].tiles.length === 0;
      style.sources[layer].tiles = [url];
      style.layers[layerIdx] = {
        ...thisLayer,
        layout: { visibility: noUrl && startVisible.includes(layer) ? "visible" : visibility },
      };
      map.setStyle(style);
    }
  } else {
    console.error("Error loading layer: ", layer, url);
  }
};

const getLayerUrl = (map, list, selectedDates, extraParams) => {
  list.forEach((layer) => {
    console.log("layer", layer);
    console.log("selectedDates", selectedDates);
    console.log("extraParams", extraParams);

    jsonRequest(URLS.GET_IMAGE_URL, { dataLayer: selectedDates[layer], type: layer })
      .then((url) => {
        // As written the URL provided must already include ? and one param so &nextParam works.
        const params = extraParams[layer];
        console.log("params", params);
        const fullUrl =
          params == null
            ? url
            : url +
              Object.entries(params)
                .map(([k, v]) => `&${k}=${v}`)
                .join("");
        selectedDates && setLayerUrl(map, layer, fullUrl);
      })
      .catch((error) => console.error(error));
  });
};

export const fitMap = (map, type, arg) => {
  if (type === "point") {
    try {
      map.flyTo({ center: arg, essential: true });
    } catch (err) {
      console.error(home.errorCoordinates);
    }
  } else if (type === "bbox") {
    try {
      map.fitBounds(arg);
    } catch (error) {
      console.error(home.errorBounds);
    }
  }
};
