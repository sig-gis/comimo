import React from "react";
import styled from "styled-components";

const LngLatHudShell = styled.div`
  background: rgba(0,0,0,0);
  bottom: 5px;
  display: inherit;
  font-size: 15px;
  height: 20px;
  line-height: 20px;
  position: fixed;
  text-align: center;
  top: unset;
  width: 100%;
`;

const LngLatHudLabel = styled.div`
  background: rgba(255,255,255,.7);
  border-radius: 2px;
  margin-left: auto;
  margin-right: auto;
  min-width: 150px;
  padding: 0px 5px;
`;

export default function LngLatHud({mouseCoords: {lat, lng}}) {
  return (
    <LngLatHudShell>
      <LngLatHudLabel>
        {lat + ", " + lng}
      </LngLatHudLabel>
    </LngLatHudShell>
  );
}
