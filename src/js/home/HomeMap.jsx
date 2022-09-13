import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

import LatLngHud from "../components/LatLngHud";
import ReportPopupContent from "./ReportPopupContent";
import InfoPopupContent from "./InfoPopupContent";
import { mapboxTokenAtom } from "../components/PageLayout";
import { extraMapParamsAtom, selectedDatesAtom, visiblePanelAtom } from "../home";

import { toPrecision, jsonRequest } from "../utils";
import { URLS, availableLayers, startVisible, attributions } from "../constants";
import { map } from "lodash";

export const mapPopupAtom = atom(null);
export const selectedLatLngAtom = atom(null);
export const homeMapAtom = atom(null);
export const selectedRegionAtom = atom(null);

export default function HomeMap({}) {
  const [mouseCoords, setMouseCoords] = useState(null);

  const extraMapParams = useAtomValue(extraMapParamsAtom);
  const selectedDates = useAtomValue(selectedDatesAtom);
  // const [homeMap, setHomeMap] = useAtom(homeMapAtom);
  const mapboxToken = useAtomValue(mapboxTokenAtom);
  const setSelectedLatLng = useSetAtom(selectedLatLngAtom);
  const [mapPopup, setMapPopup] = useAtom(mapPopupAtom);
  const visiblePanel = useAtomValue(visiblePanelAtom);
  const [homeMap, setHomeMap] = useAtom(homeMapAtom);

  const mapContainer = useRef(null);
  const [lng, setLng] = useState(-73.5609339);
  const [lat, setLat] = useState(4.6371205);
  const [zoom, setZoom] = useState(5);

  const addHomeMapPopup = (coords) =>
    addPopup(homeMap, coords, mapPopup, visiblePanel, selectedDates);

  // Effects
  useEffect(() => {
    if (!homeMap && mapboxToken !== "") {
      mapboxgl.accessToken = mapboxToken;
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/satellite-streets-v9",
        center: [lng, lat],
        zoom: zoom,
      });

      map.on("load", () => {
        addLayerSources(map, [...availableLayers].reverse());
        map.resize();

        // Add layers first in the

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));
        map.on("mousemove", (e) => {
          const lat = toPrecision(e.lngLat.lat, 4);
          const lng = toPrecision(e.lngLat.lng, 4);
          setMouseCoords({ lat, lng });
        });
      });

      setHomeMap(map);
    }
  }, [selectedDates, mapboxToken]);

  const mapOnClick = (e) => {
    addPopup(
      homeMap,
      e.lngLat,
      mapPopup,
      visiblePanel,
      selectedDates,
      setMapPopup,
      setSelectedLatLng
    );
  };

  useEffect(() => {
    if (homeMap) {
      homeMap.on("click", mapOnClick);
    }

    return () => {
      homeMap && homeMap.off("click", mapOnClick);
      mapPopup && mapPopup.remove();
      // setSelectedLatLng(null);
    };
  }, [homeMap, visiblePanel]);

  useEffect(() => {
    if (homeMap && selectedDates) {
      // For all non-mining layers (since the mining layers are the first 3 in availableLayers)
      getLayerUrl(homeMap, availableLayers.slice(3), selectedDates, extraMapParams);
    }
  }, [selectedDates]);

  useEffect(() => {
    if (homeMap && !isEmptyMap(selectedDates)) {
      Object.keys(selectedDates).length > 0 &&
        getLayerUrl(homeMap, Object.keys(selectedDates), selectedDates, extraMapParams);
    }
  }, [selectedDates]);

  useEffect(() => {
    if (homeMap && !isEmptyMap(selectedDates)) {
      Object.keys(extraMapParams).length > 0 &&
        getLayerUrl(homeMap, Object.keys(extraMapParams), selectedDates, extraMapParams);
    }
  }, [extraMapParams, selectedDates]);

  // useEffect(() => {
  //   map && setTimeout(() => map.resize(), 50);
  // }, [myHeight]);

  // Adds layers initially with no styling, URL is updated later. This is to guarantee z-index order in mapbox
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

  return (
    <>
      <MapBoxWrapper ref={mapContainer} id="mapbox" />
      {mouseCoords && <LatLngHud mouseCoords={mouseCoords} />}
    </>
  );
}

const isEmptyMap = (m) => m && Object.keys(m).length === 0;

export const addPopup = (
  map,
  { lat, lng },
  mapPopup,
  visiblePanel,
  selectedDates,
  setMapPopup,
  setSelectedLatLng
) => {
  // Remove old popup
  if (mapPopup) mapPopup.remove();

  setSelectedLatLng([lat, lng]);

  const divId = Date.now();
  const popup = new mapboxgl.Popup()
    .setLngLat([lng, lat])
    .setHTML(`<div id="${divId}"></div>`)
    .addTo(map);

  popup.on("close", (e) => {
    setSelectedLatLng(null);
  });

  // TODO: visiblePanel may not be needed when switching to Footer
  // TODO: update to use refs to clear the build warning...
  if (visiblePanel === "report") {
    ReactDOM.render(<ReportPopupContent lat={lat} lng={lng} />, document.getElementById(divId));
  } else {
    ReactDOM.render(
      <InfoPopupContent map={map} lat={lat} lng={lng} selectedDates={selectedDates} />,
      document.getElementById(divId)
    );
  }
  setMapPopup(popup);
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

const getLayerUrl = (map, list, selectedDates, extraMapParams) => {
  list.forEach((layer) => {
    jsonRequest(URLS.GET_IMAGE_URL, { dataLayer: selectedDates[layer], type: layer })
      .then((url) => {
        // As written the URL provided must already include ? and one param so &nextParam works.
        const params = extraMapParams[layer];
        const fullUrl =
          params == null
            ? url
            : url +
              Object.entries(params)
                .map(([k, v]) => `&${k}=${v}`)
                .join("");
        setLayerUrl(map, layer, fullUrl);
      })
      .catch((error) => console.error(error));
  });
};

export const fitMap = (map, type, coords, t) => {
  if (type === "point") {
    try {
      // center takes coords in the order of [lng, lat]
      map.flyTo({ center: coords, essential: true });
    } catch (err) {
      console.error(t("home.errorCoordinates"));
    }
  } else if (type === "bbox") {
    try {
      map.fitBounds(coords);
    } catch (error) {
      console.error(t("home.errorBounds"));
    }
  }
};

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
