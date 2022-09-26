import React from "react";
import styled from "@emotion/styled";

const LatLngHudLabel = styled.div`
  background: rgba(255, 255, 255, 0.7);
  bottom: calc(var(--bar-height) + 30px);
  right: 8px;
  border-radius: 2px;
  height: 20px;
  line-height: 20px;
  position: fixed;
  margin-left: auto;
  margin-right: auto;
  min-width: 150px;
  padding: 0px 5px;
  text-align: center;
`;

export default function LatLngHud({ mouseCoords: { lat, lng } }) {
  return <LatLngHudLabel>{lat + ", " + lng}</LatLngHudLabel>;
}
