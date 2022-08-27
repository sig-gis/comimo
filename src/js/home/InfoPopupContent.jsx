import React, { useContext, useEffect, useState } from "react";

import PopupMapInfo from "../components/PopupMapInfo";
import { jsonRequest, toPrecision } from "../utils";
import { URLS, availableLayers } from "../constants";
import { MainContext } from "../components/PageLayout";
import { useAtom } from "jotai";
import { selectedDatesAtom } from "../home";

// TODO: Stub
const isLayerVisible = (map, layer) => {
  map.getLayer(layer).visibility === "visible";
};

export default function InfoPopupContent({ map, lng, lat, localeText: { home } }) {
  const [layerInfo, setLayerInfo] = useState({});
  const [selectedDates, setSelectedDates] = useAtom(selectedDatesAtom);
  const visibleLayers = availableLayers.filter((layer) => isLayerVisible(map, layer));

  useEffect(() => {
    if (visibleLayers.length > 0) {
      jsonRequest(URLS.GET_INFO, { lng, lat, dates: selectedDates, visibleLayers })
        .then((resp) => setLayerInfo(resp))
        .catch((err) => console.error(err));
    }
  }, []);

  const {
    nMines,
    pMines,
    cMines,
    municipalBounds,
    protectedAreas,
    otherAuthorizations,
    legalMines,
    tierrasDeCom,
    resguardos,
  } = layerInfo;

  const layerToInfo = {
    nMines: (
      <PopupMapInfo key="nMines">
        <label>
          <strong>{home?.nMines}: </strong>
        </label>
        <label>{nMines ? home?.eeLayerDetected : home?.eeLayerNotDetected}</label>
      </PopupMapInfo>
    ),
    pMines: (
      <PopupMapInfo key="pMines">
        <label>
          <strong>{home?.pMines}: </strong>
        </label>
        <label>{pMines ? home?.eeLayerDetected : home?.eeLayerNotDetected}</label>
      </PopupMapInfo>
    ),
    cMines: (
      <PopupMapInfo key="cMines">
        <label>
          <strong>{home?.cMines}: </strong>
        </label>
        <label>{cMines ? home?.eeLayerDetected : home?.eeLayerNotDetected}</label>
      </PopupMapInfo>
    ),
    municipalBounds: (
      <PopupMapInfo key="municipalBounds">
        <label>
          <strong>{home?.municipalBoundsPopup}: </strong>
        </label>
        <label>
          {municipalBounds
            ? municipalBounds[0] + ", " + municipalBounds[1]
            : home?.municipalBoundsNotFound}
        </label>
      </PopupMapInfo>
    ),
    protectedAreas: protectedAreas && (
      <PopupMapInfo key="protectedAreas">
        <label>
          {" "}
          <strong>{home?.protectedAreasPopup}:</strong>
        </label>
        <label>{home?.protectedAreasCategory}:</label>
        <label> {protectedAreas[0]}</label>
        <label>{home?.protectedAreasName}:</label>
        <label>{protectedAreas[1]}</label>
      </PopupMapInfo>
    ),
    otherAuthorizations: otherAuthorizations && (
      <PopupMapInfo key="otherAuthorizations">
        <label>
          <strong>{home?.otherAuthorizationsPopup}: </strong>
        </label>
        <label>{otherAuthorizations}</label>
      </PopupMapInfo>
    ),
    legalMines: legalMines && (
      <PopupMapInfo key="legalMines">
        <label>
          <strong>{home?.legalMinesPopup}: </strong>
        </label>
        <label>{legalMines}</label>
      </PopupMapInfo>
    ),
    tierrasDeCom: tierrasDeCom && (
      <PopupMapInfo key="tierrasDeCom">
        <label>
          <strong>{home?.tierrasDeComPopup}: </strong>
        </label>
        <label>{tierrasDeCom}</label>
      </PopupMapInfo>
    ),
    resguardos: resguardos && (
      <PopupMapInfo key="visibleLayers">
        <label>
          <strong>{home?.resguardosPopup}: </strong>
        </label>
        <label>{resguardos}</label>
      </PopupMapInfo>
    ),
  };

  return Object.keys(layerInfo).length === visibleLayers.length ? (
    <div style={{ display: "flex", flexDirection: "column", marginRight: "0.5rem" }}>
      <PopupMapInfo key="lnglat">
        <label>
          <strong>Lng: </strong> {toPrecision(lng, 4)}
          <span>, </span>
          <strong>Lat: </strong> {toPrecision(lat, 4)}
        </label>
      </PopupMapInfo>
      {visibleLayers.map((l) => layerToInfo[l])}
    </div>
  ) : (
    <div>Loading...</div>
  );
}

// export default class InfoPopupContent extends React.Component {
//   constructor(props) {
//     super(props);

//     this.state = {
//       layerInfo: {},
//     };
//   }

//   componentDidMount() {
//     const { selectedDates, lat, lng, visibleLayers } = this.props;
//     if (visibleLayers.length > 0) {
//       jsonRequest(URLS.GET_INFO, { lat, lng, dates: selectedDates, visibleLayers })
//         .then((resp) => {
//           this.setState({ layerInfo: resp });
//         })
//         .catch((err) => console.error(err));
//     }
//   }

//   render() {
//     const {
//       layerInfo,
//       layerInfo: {
//         nMines,
//         pMines,
//         cMines,
//         municipalBounds,
//         protectedAreas,
//         otherAuthorizations,
//         legalMines,
//         tierrasDeCom,
//         resguardos,
//       },
//     } = this.state;
//     const { home, visibleLayers, lat, lng } = this.props;

//     const layerToInfo = {
//       nMines: (
//         <PopupMapInfo key="nMines">
//           <label>
//             <strong>{home?.nMines}: </strong>
//           </label>
//           <label>{nMines ? home?.eeLayerDetected : home?.eeLayerNotDetected}</label>
//         </PopupMapInfo>
//       ),
//       pMines: (
//         <PopupMapInfo key="pMines">
//           <label>
//             <strong>{home?.pMines}: </strong>
//           </label>
//           <label>{pMines ? home?.eeLayerDetected : home?.eeLayerNotDetected}</label>
//         </PopupMapInfo>
//       ),
//       cMines: (
//         <PopupMapInfo key="cMines">
//           <label>
//             <strong>{home?.cMines}: </strong>
//           </label>
//           <label>{cMines ? home?.eeLayerDetected : home?.eeLayerNotDetected}</label>
//         </PopupMapInfo>
//       ),
//       municipalBounds: (
//         <PopupMapInfo key="municipalBounds">
//           <label>
//             <strong>{home?.municipalBoundsPopup}: </strong>
//           </label>
//           <label>
//             {municipalBounds
//               ? municipalBounds[0] + ", " + municipalBounds[1]
//               : home?.municipalBoundsNotFound}
//           </label>
//         </PopupMapInfo>
//       ),
//       protectedAreas: protectedAreas && (
//         <PopupMapInfo key="protectedAreas">
//           <label>
//             {" "}
//             <strong>{home?.protectedAreasPopup}:</strong>
//           </label>
//           <label>{home?.protectedAreasCategory}:</label>
//           <label> {protectedAreas[0]}</label>
//           <label>{home?.protectedAreasName}:</label>
//           <label>{protectedAreas[1]}</label>
//         </PopupMapInfo>
//       ),
//       otherAuthorizations: otherAuthorizations && (
//         <PopupMapInfo key="otherAuthorizations">
//           <label>
//             <strong>{home?.otherAuthorizationsPopup}: </strong>
//           </label>
//           <label>{otherAuthorizations}</label>
//         </PopupMapInfo>
//       ),
//       legalMines: legalMines && (
//         <PopupMapInfo key="legalMines">
//           <label>
//             <strong>{home?.legalMinesPopup}: </strong>
//           </label>
//           <label>{legalMines}</label>
//         </PopupMapInfo>
//       ),
//       tierrasDeCom: tierrasDeCom && (
//         <PopupMapInfo key="tierrasDeCom">
//           <label>
//             <strong>{home?.tierrasDeComPopup}: </strong>
//           </label>
//           <label>{tierrasDeCom}</label>
//         </PopupMapInfo>
//       ),
//       resguardos: resguardos && (
//         <PopupMapInfo key="visibleLayers">
//           <label>
//             <strong>{home?.resguardosPopup}: </strong>
//           </label>
//           <label>{resguardos}</label>
//         </PopupMapInfo>
//       ),
//     };

//     return Object.keys(layerInfo).length === visibleLayers.length ? (
//       <div style={{ display: "flex", flexDirection: "column", marginRight: "0.5rem" }}>
//         <PopupMapInfo key="latlngg">
//           <label>
//             <strong>Lat: </strong>
//             {toPrecision(lat, 4)}, <strong>lngg: </strong>
//             {toPrecision(lng, 4)}
//           </label>
//         </PopupMapInfo>
//         {availableLayers.filter((l) => visibleLayers.includes(l)).map((l) => layerToInfo[l])}
//       </div>
//     ) : (
//       <div>Loading...</div>
//     );
//   }
// }
