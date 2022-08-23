import React from "react";
import styled from "@emotion/styled";

const SideBarContainer = styled.div`
  align-items: center;
  background: var(--gray-1);
  box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  height: calc(100% - 3.5rem);
  margin: 0;
  padding: 0;
  position: absolute;
  top: 3.5rem;
  width: 60px;
  z-index: 99;

  @media only screen and (orientation: portrait) {
    bottom: 0;
    flex-direction: row;
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

export default function SideBar({ children }) {
  return <SideBarContainer id="side-bar">{children}</SideBarContainer>;
}
