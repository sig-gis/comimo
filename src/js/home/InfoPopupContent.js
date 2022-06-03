import React from "react";

import PopupMapInfo from "../components/PopupMapInfo";

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
        <PopupMapInfo key="nMines">
          <label><b>{localeText.nMines}: </b></label>
          <label>{nMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}</label>
        </PopupMapInfo>,
      pMines:
        <PopupMapInfo key="pMines">
          <label><b>{localeText.nMines}: </b></label>
          <label>{pMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}</label>
        </PopupMapInfo>,
      cMines:
        <PopupMapInfo key="cMines">
          <label><b>{localeText.cMines}: </b></label>
          <label>{cMines ? localeText.eeLayerDetected : localeText.eeLayerNotDetected}</label>
        </PopupMapInfo>,
      municipalBounds:
        <PopupMapInfo key="municipalBounds">
          <label><b>{localeText.municipalBoundsPopup}: </b></label>
          <label>{municipalBounds ? municipalBounds[0] + ", " + municipalBounds[1] : localeText.municipalBoundsNotFound}</label>
        </PopupMapInfo>,
      protectedAreas: protectedAreas
        && (
          <PopupMapInfo key="protectedAreas">
            <label> <b>{localeText.protectedAreasPopup}:</b></label>
            <label>{localeText.protectedAreasCategory}:</label>
            <label> {protectedAreas[0]}</label>
            <label>{localeText.protectedAreasName}:</label>
            <label>{protectedAreas[1]}</label>
          </PopupMapInfo>
        ),
      otherAuthorizations: otherAuthorizations && (
        <PopupMapInfo key="otherAuthorizations">
          <label><b>{localeText.otherAuthorizationsPopup}: </b></label>
          <label>{otherAuthorizations}</label>
        </PopupMapInfo>
      ),
      legalMines: legalMines
        && (
          <PopupMapInfo key="legalMines">
            <label><b>{localeText.legalMinesPopup}: </b></label>
            <label>{legalMines}</label>
          </PopupMapInfo>
        ),
      tierrasDeCom: tierrasDeCom
        && (
          <PopupMapInfo key="tierrasDeCom">
            <label><b>{localeText.tierrasDeComPopup}: </b></label>
            <label>{tierrasDeCom}</label>
          </PopupMapInfo>
        ),
      resguardos: resguardos && (
        <PopupMapInfo key="visibleLayers">
          <label><b>{localeText.resguardosPopup}: </b></label>
          <label>{resguardos}</label>
        </PopupMapInfo>
      )
    };

    return (Object.keys(layerInfo).length === visibleLayers.length
      ? (
        <div className="d-flex flex-column">
          <PopupMapInfo key="latLong">
            <label><b>Lat: </b></label>
            <label>{toPrecision(lat, 4)}</label>
            <label><b>Long: </b></label>
            <label>{toPrecision(lon, 4)}</label>
          </PopupMapInfo>
          {availableLayers.filter(l => visibleLayers.includes(l)).map(l => layerToInfo[l])}
        </div>
      )
      : <div>Loading...</div>
    );
  }
}
