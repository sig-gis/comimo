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

// const fitMap = (type, arg) => {
//   const [map, setMap] = useAtom(mapAtom);
//   if (type === "point") {
//     try {
//       map.flyTo({ center: arg, essential: true });
//     } catch (err) {
//       console.error(home.errorCoordinates);
//     }
//   } else if (type === "bbox") {
//     try {
//       map.fitBounds(arg);
//     } catch (error) {
//       console.error(home.errorBounds);
//     }
//   }
// };

const addPopup = (map, lng, lat, visiblePanel, mapPopup, localeText) => {
  // Remove old popup
  if (mapPopup) mapPopup.remove();

  const divId = Date.now();
  const popup = new mapboxgl.Popup()
    .setLngLat([lng, lat])
    .setHTML(`<div id="${divId}"></div>`)
    .addTo(map.current);

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

export default function HomeMap({ extraParams, mapboxToken, visiblePanel }) {
  // Initial State
  // const [thePopup, setThePopup] = useState(null);
  const [mouseCoords, setMouseCoords] = useState(null);
  const [mapPopup, setMapPopup] = useAtom(mapPopupAtom);
  const [selectedLngLat, setSelectedLngLat] = useAtom(selectedLngLatAtom);
  const [selectedDates, setSelectedDates] = useState(selectedDatesAtom);
  const { localeText } = useContext(MainContext);
  // const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom);
  // const [map, setMap] = useAtom(mapAtom);

  const mapContainer = useRef(null);
  const map = useRef(null);
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
        setMapPopup(addPopup(map, lng, lat, visiblePanel, mapPopup, localeText));
      });
      // setMap(map.current);
      // // This is a bit hard coded
      // getLayerUrl(availableLayers.slice(3));
      // if (Object.keys(selectedDates).length) getLayerUrl(Object.keys(selectedDates));
    });
  });

  // useEffect(() => {
  //   // console.log("useEffect Object.keys(selectedDates)", Object.keys(selectedDates));
  //   map && Object.keys(selectedDates).length > 0 && getLayerUrl(Object.keys(selectedDates));
  // }, [selectedDates]);

  // useEffect(() => {
  //   console.log("useEffect Object.keys(extraParams)", Object.keys(extraParams));
  //   map && Object.keys(extraParams).length > 0 && getLayerUrl(Object.keys(extraParams));
  // }, [extraParams]);

  // useEffect(() => {
  //   map && setTimeout(() => map.resize(), 50);
  // }, [myHeight]);

  // MapBox functions
  // const setLayerUrl = (layer, url) => {
  //   // theMap &&
  //   if (layer && url && url !== "") {
  //     const style = map.getStyle();
  //     const layers = style.layers;
  //     const layerIdx = layers.findIndex((l) => l.id === layer);
  //     const thisLayer = layers[layerIdx];
  //     const {
  //       layout: { visibility },
  //     } = thisLayer;
  //     const noUrl = style.sources[layer].tiles.length === 0;
  //     style.sources[layer].tiles = [url];
  //     style.layers[layerIdx] = {
  //       ...thisLayer,
  //       layout: { visibility: noUrl && startVisible.includes(layer) ? "visible" : visibility },
  //     };
  //     map.setStyle(style);
  //   } else {
  //     console.error("Error loading layer: ", layer, url);
  //   }
  // };

  // const getLayerUrl = (list) => {
  //   list.forEach((layer) => {
  //     jsonRequest(URLS.GET_IMAGE_URL, { dataLayer: selectedDates[layer], type: layer })
  //       .then((url) => {
  //         // As written the URL provided must already include ? and one param so &nextParam works.
  //         const params = extraParams[layer];
  //         const fullUrl =
  //           params == null
  //             ? url
  //             : url +
  //               Object.entries(params)
  //                 .map(([k, v]) => `&${k}=${v}`)
  //                 .join("");
  //         setLayerUrl(layer, fullUrl);
  //       })
  //       .catch((error) => console.error(error));
  //   });
  // };

  // const addPopup = (lat, lon) => {
  //   // const [map, setMap] = useAtom(mapAtom);
  //   const [mapPopup, setMapPopup] = useAtom(mapPopupAtom);
  //   const [selectedLatLon, setSelectedLatLon] = useAtom(selectedLatLonAtom);
  //   const [selectedDates, setSelectedDates] = useState(selectedDatesAtom);

  //   // Remove old popup
  //   if (mapPopup) mapPopup.remove();

  //   const divId = Date.now();
  //   const popup = new mapboxgl.Popup()
  //     .setLngLat([lon, lat])
  //     .setHTML(`<div id="${divId}"></div>`)
  //     .addTo(map);

  //   setMapPopup(popup);
  //   setSelectedLatLon([lat, lon]);

  //   if (visiblePanel === "report") {
  //     ReactDOM.render(
  //       <ReportPopupContent lat={lat} localeText={localeText} lon={lon} />,
  //       document.getElementById(divId)
  //     );
  //   } else {
  //     // const visibleLayers = availableLayers.map((l) => isLayerVisible(l) && l).filter((l) => l);
  //     ReactDOM.render(
  //       <InfoPopupContent
  //         lat={lat}
  //         lon={lon}
  //         // TODO useAtom for those two
  //         // selectedDates={selectedDates}
  //         // visibleLayers={visibleLayers}
  //       />,
  //       document.getElementById(divId)
  //     );
  //   }
  // };

  const initMap = () => {
    // const [map, setMap] = useAtom(mapAtom);

    // mapboxgl.accessToken = mapboxToken;

    // const newMap = new mapboxgl.Map({
    //   container: "mapbox",
    //   style: "mapbox://styles/mapbox/satellite-streets-v9",
    //   center: [-73.5609339, 4.6371205],
    //   zoom: 5,
    // });
    setTimeout(() => newMap.resize(), 1);

    newMap.on("load", () => {
      // Add layers first in the
      addLayerSources(newMap, [...availableLayers].reverse());

      newMap.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

      newMap.on("mousemove", (e) => {
        const lat = toPrecision(e.lngLat.lat, 4);
        const lng = toPrecision(e.lngLat.lng, 4);
        setMouseCoords({ lat, lng });
      });
      newMap.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        addPopup(lat, lng);
      });

      setMap(newMap);

      // This is a bit hard coded
      getLayerUrl(availableLayers.slice(3));
      if (Object.keys(selectedDates).length) getLayerUrl(Object.keys(selectedDates));
    });
  };

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

//   setLayerUrl = (layer, url) => {
//     if (layer && url && url !== "") {
//       const { theMap } = this.props;
//       const style = theMap.getStyle();
//       const layers = style.layers;
//       const layerIdx = layers.findIndex((l) => l.id === layer);
//       const thisLayer = layers[layerIdx];
//       const {
//         layout: { visibility },
//       } = thisLayer;
//       const noUrl = style.sources[layer].tiles.length === 0;
//       style.sources[layer].tiles = [url];
//       style.layers[layerIdx] = {
//         ...thisLayer,
//         layout: { visibility: noUrl && startVisible.includes(layer) ? "visible" : visibility },
//       };
//       theMap.setStyle(style);
//     } else {
//       console.error("Error loading layer: ", layer, url);
//     }
//   };

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
