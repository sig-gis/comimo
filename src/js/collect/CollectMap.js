import React from "react";
import mapboxgl from "mapbox-gl";
import styled from "styled-components";
import "mapbox-gl/dist/mapbox-gl.css";

import LngLatHud from "../components/LngLatHud";

import {mapboxToken} from "../appConfig";
import {toPrecision} from "../utils";

const MapBoxWrapper = styled.div`
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
      coords: null
    };
  }

  /// Lifecycle Functions ///

  componentDidMount() {
    this.initMap();
  }

  mapChange = (prevProps, key) => this.props.theMap && this.props[key]
      && (prevProps.theMap !== this.props.theMap
        || prevProps[key] !== this.props[key]);

  componentDidUpdate(prevProps, _prevState) {
    if (this.mapChange(prevProps, "myHeight")) {
      setTimeout(() => this.props.theMap.resize(), 50);
    }

    if (this.mapChange(prevProps, "boundary")) {
      this.updateBound();
    }
  }

  updateBound = () => {
    const {theMap, boundary} = this.props;
    theMap.addSource("boundary", {
      "type": "geojson",
      "data": {
        "type": "Feature",
        "properties": {},
        "geometry": boundary
      }
    });
    theMap.addLayer({
      "id": "route",
      "type": "line",
      "source": "boundary",
      "layout": {
        "line-join": "round",
        "line-cap": "round"
      },
      "paint": {
        "line-color": "yellow",
        "line-width": 4
      }
    });
  };

  /// API Calls ///

  /// Mapbox TODO move to separate component

  initMap = () => {
    mapboxgl.accessToken = mapboxToken;
    const theMap = new mapboxgl.Map({
      container: "mapbox",
      style: "mapbox://styles/mapbox/satellite-streets-v9",
      center: [-73.5609339, 4.6371205],
      zoom: 5
    });

    theMap.on("load", () => {
      this.props.setMap(theMap);
      theMap.addControl(new mapboxgl.NavigationControl({showCompass: false}));

      theMap.on("mousemove", e => {
        const lat = toPrecision(e.lngLat.lat, 4);
        const lng = toPrecision(e.lngLat.lng, 4);
        this.setState({coords: {lat, lng}});
      });
    });
  };

  isLayerVisible = layer => this.props.theMap.getLayer(layer).visibility === "visible";

  render() {
    const {coords} = this.state;
    return (
      <>
        <MapBoxWrapper
          id="mapbox"
          style={{
            height: "100%",
            width: "100%",
            margin: 0,
            padding: 0,
            position: "relative"
          }}
        />
        {coords && <LngLatHud coords={coords}/>}
      </>
    );
  }
}
