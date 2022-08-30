import React, { useState } from "react";
import styled from "@emotion/styled";

import { visiblePanelAtom } from "../home";

import SvgIcon from "./SvgIcon";
import { useAtom } from "jotai";

const PanelOuter = styled.div`
  background: #fffff8;
  border-radius: 6px 6px 0 0;
  bottom: var(--bar-height);
  display: ${({ active }) => (active ? "flex" : "none")};
  flex-direction: column;
  max-height: calc(100% - (2 * var(--bar-height)));
  position: absolute;
  width: 33vw;
  z-index: 99;
`;

const Title = styled.div`
  background-color: var(--gray-1);
  border: 1px solid var(--gray-3);
  border-radius: 6px 6px 0 0;
  color: var(--white);
  display: flex;
  font: normal normal bold 18px/21px Roboto;
  justify-content: space-between;
  padding: 0.5rem;
  text-align: left;
  text-transform: uppercase;
`;

const Content = styled.div`
  overflow: auto;
  padding: 1rem;
`;

export default function ToolCard({ title, active, children }) {
  const [visiblePanel, setVisiblePanel] = useAtom(visiblePanelAtom);
  return (
    <PanelOuter id={`tool-panel-${title?.replaceAll(" ", "-").toLowerCase()}`} active={active}>
      <Title>
        {title}
        <SvgIcon
          onClick={() => setVisiblePanel(null)}
          icon="close"
          color="white"
          hoverFill="var(--gray-3)"
          size="24px"
        />
      </Title>
      <Content>{children}</Content>
    </PanelOuter>
  );
}
