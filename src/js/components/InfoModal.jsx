import React from "react";
import styled from "@emotion/styled";

import SvgIcon from "./SvgIcon";

const OuterContainer = styled.div`
  background: #0000009e;
  height: 100%;
  left: 0;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 101;

  &.p {
    white-space: pre-wrap;
  }
`;

const InnerContainer = styled.div`
  background: #262626e8 0% 0% no-repeat padding-box;
  border: 3px solid;
  border-color: var(--white);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  height: 80%;
  left: 0;
  margin: 50px auto;
  max-width: 980px;
  overflow: auto;
  padding: 1.5rem;
  position: relative;
  right: 0;
  width: 90%;
  z-index: 101;
`;

const Header = styled.h1`
  color: var(--yellow-brand);
  border-bottom: solid 2px var(--white);
  font: var(--unnamed-font-style-normal) normal bold 32px/32px var(--unnamed-font-family-roboto);
  padding-bottom: 15px;
  text-align: left;
  text-transform: uppercase;
`;

const Body = styled.div`
  color: var(--white);
`;

const CloseDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-left: 1.5rem;
`;

export default function InfoModal({ onClose, title, children }) {
  return (
    <OuterContainer>
      <InnerContainer>
        <CloseDiv onClick={onClose}>
          <SvgIcon color="white" icon="close" hoverFill="var(--orange-2)" size="2rem" />
        </CloseDiv>
        <Header>{title}</Header>
        <Body>{children}</Body>
      </InnerContainer>
    </OuterContainer>
  );
}
