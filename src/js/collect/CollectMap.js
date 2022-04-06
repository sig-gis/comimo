import React from "react";
import mapboxgl from "mapbox-gl";
import extent from "turf-extent";
import styled from "styled-components";
import "mapbox-gl/dist/mapbox-gl.css";

import {get, isString} from "lodash";
import LngLatHud from "../components/LngLatHud";

import {mapboxToken} from "../appConfig";
import {toPrecision} from "../utils";

const MapBoxWrapper = styled.div`
  height: 100%;
  margin: 0;
  padding: 0;
  position: "relative";
  width: 100%;

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

  mapChange = (prevProps, key) => {
    const keys = isString(key) ? [key] : key;
    return this.props.theMap && get(this.props, keys)
      && (prevProps.theMap !== this.props.theMap
        || get(prevProps, keys) !== get(this.props, keys));
  };

  componentDidUpdate(prevProps, _prevState) {
    if (this.mapChange(prevProps, "myHeight")) {
      setTimeout(() => this.props.theMap.resize(), 50);
    }

    if (this.mapChange(prevProps, "boundary")) {
      this.addBoundary();
    }

    if (this.mapChange(prevProps, ["projectPlots", "length"])) {
      this.addPlots();
    }

    if (this.props.projectPlots && this.mapChange(prevProps, "currentPlot")) {
      this.updateVisiblePlot();
    }
  }

  /// Mapbox ///

  initMap = () => {
    mapboxgl.accessToken = mapboxToken;
    const theMap = new mapboxgl.Map({
      container: "mapbox",
      style: "mapbox://styles/mapbox/satellite-streets-v9",
      center: [-73.5609339, 4.6371205],
      zoom: 5
    });
    setTimeout(() => theMap.resize(), 1);

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

  fitMap = (type, arg) => {
    const {theMap} = this.props;
    if (type === "point") {
      try {
        theMap.flyTo({center: arg, essential: true});
      } catch (err) {
        console.error(err);
      }
    } else if (type === "bbox") {
      try {
        theMap.fitBounds(arg, {padding: {top: 16, bottom: 94, left: 16, right: 16}});
      } catch (error) {
        console.error(error);
      }
    }
  };

  addBoundary = () => {
    const {theMap, boundary} = this.props;
    const geoJSON = {
      type: "Feature",
      geometry: boundary
    };
    theMap.addSource("boundary", {
      type: "geojson",
      data: geoJSON
    });
    theMap.addLayer({
      id: "boundary",
      type: "line",
      source: "boundary",
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        "line-color": "yellow",
        "line-width": 4
      }
    });
    this.fitMap("bbox", extent(geoJSON));
  };

  plotColor = answer => (answer === "Mina"
    ? "red"
    : answer === "No Mina"
      ? "green"
      : "blue");

  addPlots = () => {
    const {theMap, projectPlots} = this.props;
    const geoJSON = {
      type: "FeatureCollection",
      features: projectPlots.map(p => ({
        type: "Feature",
        properties: {id: p.id},
        geometry: p.geom
      }))
    };
    theMap.addSource("plots", {
      type: "geojson",
      data: geoJSON
    });
    projectPlots.forEach(p => {
      theMap.addLayer({
        id: p.id + "", // mapbox needs a string
        type: "line",
        source: "plots",
        filter: ["==", ["get", "id"], p.id],
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": this.plotColor(p.answer),
          "line-width": 4
        }
      });
    });
  };

  updateVisiblePlot = () => {
    const {theMap, projectPlots, currentPlot: {geom, id, answer}} = this.props;
    if (geom) {
      // Set new color
      theMap.setPaintProperty(
        id + "",
        "line-color",
        this.plotColor(answer)
      );
      // Update visibility
      projectPlots.forEach(p => {
        const lName = p.id + "";
        if (theMap.getLayer(lName)) {
          theMap.setLayoutProperty(
            lName,
            "visibility",
            id === p.id ? "visible" : "none"
          );
        }
      });
      this.fitMap("bbox", extent(geom));
    }
  };

  render() {
    const {coords} = this.state;
    return (
      <>
        <MapBoxWrapper id="mapbox"/>
        {coords && <LngLatHud coords={coords}/>}
      </>
    );
  }
}
