import React, { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";
import { atom, useAtom } from "jotai";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";

import LngLatHud from "../components/LngLatHud";

import { MainContext } from "../components/PageLayout";
import { toPrecision, jsonRequest } from "../utils";
import { URLS, availableLayers, startVisible, attributions } from "../constants";

import { theMapAtom } from "../home";

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

export default function HomeMap({ extraParams, mapboxToken, selectedDates, addPopup }) {
  // Initial State
  // const [thePopup, setThePopup] = useState(null);
  const [mouseCoords, setMouseCoords] = useState(null);
  const { myHeight } = useContext(MainContext);
  const [theMap, setTheMap] = useAtom(theMapAtom);

  // Effects
  useEffect(() => {
    initMap();
  }, []);

  useEffect(() => {
    console.log("useEffect Object.keys(selectedDates)", Object.keys(selectedDates));
    theMap &&
      Object.keys(selectedDates).length > 0 &&
      getLayerUrl(theMap, Object.keys(selectedDates));
  }, [theMap, selectedDates]);

  useEffect(() => {
    console.log("useEffect Object.keys(extraParams)", Object.keys(extraParams));
    theMap && Object.keys(extraParams).length > 0 && getLayerUrl(theMap, Object.keys(extraParams));
  }, [theMap, extraParams]);

  useEffect(() => {
    theMap && setTimeout(() => theMap.resize(), 50);
  }, [myHeight]);

  // MapBox functions
  const setLayerUrl = (map, layer, url) => {
    // theMap &&
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

  const getLayerUrl = (map, list) => {
    list.forEach((layer) => {
      // console.log("selected layer:", selectedDates[layer]);
      // console.log("selected layer type:", layer);
      // console.log("extraParams", extraParams);
      // console.log("extraParams[layer]", extraParams[layer]);
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

  const initMap = () => {
    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: "mapbox",
      style: "mapbox://styles/mapbox/satellite-streets-v9",
      center: [-73.5609339, 4.6371205],
      zoom: 5,
    });
    setTimeout(() => map.resize(), 1);

    map.on("load", () => {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }));

      // Add layers first in the
      addLayerSources(map, [...availableLayers].reverse());

      map.on("mousemove", (e) => {
        const lat = toPrecision(e.lngLat.lat, 4);
        const lng = toPrecision(e.lngLat.lng, 4);
        setMouseCoords({ lat, lng });
      });
      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        addPopup(map, lat, lng);
      });

      // setTheMap(map);
      // console.log("The map after init:", map);

      // This is a bit hard coded
      getLayerUrl(map, availableLayers.slice(3));
      if (Object.keys(selectedDates).length) getLayerUrl(map, Object.keys(selectedDates));
    });

    setTheMap(map);
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
