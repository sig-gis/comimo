import React from "react";
import styled from "@emotion/styled";

const PanelOuter = styled.div`
  background: #fffff8;
  display: flex;
  flex-direction: column;
  height: 100%;
  /* left: x; */
  position: absolute;
  bottom: 60px;
  width: 33vw;
  z-index: 99;
  display: ${({ active }) => !active && "none"};
`;

const Title = styled.h2`
  border-bottom: 1px solid gray;
  font-weight: bold;
  padding: 0.5rem;
`;

const Content = styled.div`
  overflow: auto;
  padding: 1rem;
`;

export default function ToolPanel({ title, active, children }) {
  return (
    <PanelOuter id={`tool-panel-${title.replaceAll(" ", "-").toLowerCase()}`} active={active}>
      <Title>{title}</Title>
      <Content>{children}</Content>
    </PanelOuter>
  );
}
