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

import { toPrecision, jsonRequest } from "../utils";
import { URLS, availableLayers, startVisible, attributions } from "../constants";

// import { mapAtom } from "../home";

// TODO add theMap into an atom and use the same atom in home.jsx

export const mapAtom = atom(null);
export const mapPopupAtom = atom(null);
export const selectedLngLatAtom = atom([]);
export const selectedDatesAtom = atom({});

const fitMap = (map, type, arg) => {
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
  } else {
    console.error("Error loading layer: ", layer, url);
  }
};

const getLayerUrl = (map, list, selectedDates, extraParams) => {
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
        setLayerUrl(map, layer, fullUrl);
      })
      .catch((error) => console.error(error));
  });
};

export default function HomeMap({ map, extraParams, mapboxToken, visiblePanel }) {
  // Initial State
  const [mouseCoords, setMouseCoords] = useState(null);
  const [mapPopup, setMapPopup] = useAtom(mapPopupAtom);
  const [selectedLngLat, setSelectedLngLat] = useAtom(selectedLngLatAtom);
  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom);
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

      // console.log("selectedDates", selectedDates);
      getLayerUrl(map.current, availableLayers.slice(3), selectedDates, extraParams);

      if (Object.keys(selectedDates).length)
        getLayerUrl(map, Object.keys(selectedDates), selectedDates, extraParams);
    });
  });

  useEffect(() => {
    map.current &&
      Object.keys(selectedDates).length > 0 &&
      getLayerUrl(map.current, Object.keys(selectedDates), selectedDates, extraParams);
  }, [selectedDates]);

  useEffect(() => {
    map.current &&
      Object.keys(extraParams).length > 0 &&
      getLayerUrl(map.current, Object.keys(extraParams), selectedDates, extraParams);
  }, [extraParams]);

  // TODO: We might not need this...

  useEffect(() => {
    map.current && setTimeout(() => map.current.resize(), 50);
  }, [myHeight]);

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

/// OLD:

// export default class HomeMap extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       thePopup: null,
//       mouseCoords: null,
//     };
//   }

//   /// Lifecycle Functions ///

//   componentDidMount() {
//     this.initMap();
//   }

//   componentDidUpdate(prevProps, _prevState) {
//     if (this.props.theMap && prevProps.myHeight !== this.props.myHeight) {
//       setTimeout(() => this.props.theMap.resize(), 50);
//     }

//     if (this.state.thePopup && prevProps.reportPopup && !this.props.reportPopup) {
//       this.state.thePopup.remove();
//     }

//     if (
//       this.props.theMap &&
//       Object.keys(this.props.selectedDates).length > 0 &&
//       (prevProps.theMap !== this.props.theMap ||
//         prevProps.selectedDates !== this.props.selectedDates)
//     ) {
//       this.getLayerUrl(Object.keys(this.props.selectedDates));
//     }

//     if (
//       this.props.theMap &&
//       Object.keys(this.props.extraParams).length > 0 &&
//       (prevProps.theMap !== this.props.theMap || prevProps.extraParams !== this.props.extraParams)
//     ) {
//       this.getLayerUrl(Object.keys(this.props.extraParams));
//     }
//   }

//   /// Mapbox ///

//   getLayerUrl = (list) => {
//     const { selectedDates } = this.props;
//     list.forEach((layer) => {
//       jsonRequest(URLS.GET_IMAGE_URL, { dataLayer: selectedDates[layer], type: layer })
//         .then((url) => {
//           // As written the URL provided must already include ? and one param so &nextParam works.
//           const params = this.props.extraParams[layer];
//           const fullUrl =
//             params == null
//               ? url
//               : url +
//                 Object.entries(params)
//                   .map(([k, v]) => `&${k}=${v}`)
//                   .join("");
//           this.setLayerUrl(layer, fullUrl);
//         })
//         .catch((error) => console.error(error));
//     });
//   };

//   initMap = () => {
//     const { selectedDates, mapboxToken, addPopup } = this.props;
//     mapboxgl.accessToken = mapboxToken;
//     const theMap = new mapboxgl.Map({
//       container: "mapbox",
//       style: "mapbox://styles/mapbox/satellite-streets-v9",
//       center: [-73.5609339, 4.6371205],
//       zoom: 5,
//     });
//     setTimeout(() => theMap.resize(), 1);

//     theMap.on("load", () => {
//       theMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

//       // Add layers first in the
//       this.addLayerSources(theMap, [...availableLayers].reverse());

//       theMap.on("mousemove", (e) => {
//         const lat = toPrecision(e.lngLat.lat, 4);
//         const lng = toPrecision(e.lngLat.lng, 4);
//         this.setState({ mouseCoords: { lat, lng } });
//       });
//       theMap.on("click", (e) => {
//         const { lng, lat } = e.lngLat;
//         addPopup(lat, lng);
//       });

//       this.props.setMap(theMap);
//       // This is a bit hard coded
//       this.getLayerUrl(availableLayers.slice(3));
//       if (Object.keys(selectedDates).length) this.getLayerUrl(Object.keys(selectedDates));
//     });
//   };

//   // Adds layers initially with no styling, URL is updated later.  This is to guarantee z order in mapbox
//   addLayerSources = (theMap, list) => {
//     list.forEach((name) => {
//       theMap.addSource(name, {
//         type: "raster",
//         tiles: [],
//         tileSize: 256,
//         vis: { palette: [] },
//         ...(attributions[name] && { attribution: attributions[name] }),
//       });
//       theMap.addLayer({
//         id: name,
//         type: "raster",
//         source: name,
//         minzoom: 0,
//         maxzoom: 22,
//         layout: { visibility: "none" },
//       });
//     });
//   };

//   render() {
//     const { mouseCoords } = this.state;
//     return (
//       <>
//         <MapBoxWrapper id="mapbox" />
//         {mouseCoords && <LngLatHud mouseCoords={mouseCoords} />}
//       </>
//     );
//   }
// }
// HomeMap.contextType = MainContext;
