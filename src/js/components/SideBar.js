import React from "react";
import styled from "@emotion/styled";

const SideBarContainer = styled.div`
  background: #ffffee;
  box-shadow: 0px 0px 0px 1px rgba(0,0,0,.1);
  height: calc(100% - 3.5rem);
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  position: absolute;
  top: 3.5rem;
  width: 50px;
  z-index: 99;

  @media only screen and (orientation: portrait) {
    bottom: 0;
    height: 75px;
    left: 0;
    position: absolute;
    top: inherit;
    overflow-x: auto;
    overflow-y: hidden;
    width: 100%;
    white-space: nowrap;
  }
`;

export default function SideBar({children}) {
  return (
    <SideBarContainer>
      {children}
    </SideBarContainer>
  );
}
