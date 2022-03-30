import React from "react";
import styled from "styled-components";

const LngLatHudShell = styled.div`
  position: fixed;
  top: unset;
  bottom: 5px;
  width: 100%;
  height: 20px;
  background: rgba(0,0,0,0);
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  display: inherit;
`;

const LngLatHudLabel = styled.div`
  background: rgba(255,255,255,.7);
  border-radius: 2px;
  min-width: 150px;
  padding: 0px 5px;
  margin-left: auto;
  margin-right: auto;
`;

export default function LngLatHud({coords: {lat, lng}}) {
  return (
    <LngLatHudShell>
      <LngLatHudLabel>
        {lat + ", " + lng}
      </LngLatHudLabel>
    </LngLatHudShell>
  );
}
