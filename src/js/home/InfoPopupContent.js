import React from "react";

import {jsonRequest, toPrecision} from "../utils";
import {URLS} from "./constants";

export default class InfoPopupContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      layerInfo: {}
    };
  }

  componentDidMount() {
    const {selectedDates, lat, lon, visibleLayers} = this.props;
    if (visibleLayers.length > 0) {
      jsonRequest(URLS.GET_INFO, {lat, lon, dates: selectedDates, visibleLayers})
        .then(resp => {
          this.setState({layerInfo: resp.value});
        })
        .catch(err => console.error(err));
    }
  }

  render() {
    const {
      layerInfo,
      layerInfo: {
        nMines,
        pMines,
        cMines,
        municipalBounds,
        protectedAreas,
        otherAuthorizations,
        legalMines,
        tierrasDeCom,
        resguardos
      }
    } = this.state;
    const {visibleLayers, localeText, lat, lon} = this.props;
    return Object.keys(layerInfo).length === visibleLayers.length
      ? (
        <div className="d-flex flex-column font-small">
          <div>
            <b>Lat, lon:</b> {toPrecision(lat, 4)}, {toPrecision(lon, 4)}
          </div>
          {visibleLayers.includes("nMines") && (
            <div>
              <b>{localeText.nMines}:</b> {nMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
            </div>
          )}
          {visibleLayers.includes("pMines") && (
            <div>
              <b>{localeText.pMines}:</b> {pMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
            </div>
          )}
          {visibleLayers.includes("cMines") && (
            <div>
              <b>{localeText.cMines}:</b> {cMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
            </div>
          )}
          {visibleLayers.includes("municipalBounds") && (
            <div>
              <b>{localeText.municipalBoundsPopup}:</b> {municipalBounds || localeText.municipalBoundsNotFound}
            </div>
          )}
          {visibleLayers.includes("protectedAreas") && protectedAreas && (
            <div>
              <b>{localeText.protectedAreasPopup}:</b>
              {localeText.protectedAreasCategory}: {protectedAreas[0]}
              {localeText.protectedAreasName}: {protectedAreas[1]}
            </div>
          )}
          {visibleLayers.includes("otherAuthorizations") && otherAuthorizations && (
            <div><b>{localeText.otherAuthorizationsPopup}:</b> {otherAuthorizations}</div>
          )}
          {visibleLayers.includes("legalMines") && legalMines && (
            <div><b>{localeText.legalMinesPopup}:</b> {legalMines}</div>
          )}
          {visibleLayers.includes("tierrasDeCom") && tierrasDeCom && (
            <div><b>{localeText.tierrasDeComPopup}:</b> {tierrasDeCom}</div>
          )}
          {visibleLayers.includes("resguardos") && resguardos && (
            <div><b>{localeText.resguardosPopup}:</b> {resguardos}</div>
          )}
        </div>
      ) : (
        <div>Loading...</div>
      );
  }
}
