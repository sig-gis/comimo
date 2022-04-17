import React from "react";

import {jsonRequest, toPrecision} from "../utils";
import {URLS, availableLayers} from "../constants";

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
          this.setState({layerInfo: resp});
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
    const layerToInfo = {
      nMines:
        <div key="nMines">
          <b>{localeText.nMines}: </b>{nMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
        </div>,
      pMines:
        <div key="pMines">
          <b>{localeText.nMines}: </b>{pMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
        </div>,
      cMines:
        <div key="cMines">
          <b>{localeText.cMines}: </b>{cMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}
        </div>,
      municipalBounds:
        <div key="municipalBounds">
          <b>{localeText.municipalBoundsPopup}: </b>
          {municipalBounds ? municipalBounds[0] + ", " + municipalBounds[1] : localeText.municipalBoundsNotFound}
        </div>,
      protectedAreas: protectedAreas
          && (
            <div key="protectedAreas">
              <b>{localeText.protectedAreasPopup}:</b>
              {localeText.protectedAreasCategory}: {protectedAreas[0]}
              {localeText.protectedAreasName}: {protectedAreas[1]}
            </div>
          ),
      otherAuthorizations: otherAuthorizations && <div key="otherAuthorizations"><b>{localeText.otherAuthorizationsPopup}: </b>{otherAuthorizations}</div>,
      legalMines: legalMines && <div key="legalMines"><b>{localeText.legalMinesPopup}: </b>{legalMines}</div>,
      tierrasDeCom: tierrasDeCom && <div key="tierrasDeCom"><b>{localeText.tierrasDeComPopup}: </b>{tierrasDeCom}</div>,
      visibleLayers: resguardos && <div key="visibleLayers"><b>{localeText.resguardosPopup}: </b>{resguardos}</div>
    };

    return (Object.keys(layerInfo).length === visibleLayers.length
      ? (
        <div className="d-flex flex-column font-small">
          <div>
            <b>Lat, lon:</b> {toPrecision(lat, 4)}, {toPrecision(lon, 4)}
          </div>
          {availableLayers.filter(l => visibleLayers.includes(l)).map(l => layerToInfo[l])}
        </div>
      )
      : (
        <div>Loading...</div>
      )
    );
  }
}
