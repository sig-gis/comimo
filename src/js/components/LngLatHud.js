import React from "react";
import styled from "@emotion/styled";

const LngLatHudLabel = styled.div`
  background: rgba(255,255,255,.7);
  bottom: 32px;
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

export default function LngLatHud({mouseCoords: {lat, lng}}) {
  return (
    <LngLatHudLabel>
      {lat + ", " + lng}
    </LngLatHudLabel>
  );
}
