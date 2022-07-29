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
  z-index: 100;

  &.p {
    white-space: pre-wrap;
  }
`;

const InnerContainer = styled.div`
  background: white;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  height: 80%;
  left: 0;
  margin: 50px auto;
  max-width: 40rem;
  padding: 1.5rem;
  position: relative;
  right: 0;
  width: 90%;
`;

const CloseRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

export default function InfoModal({ onClose, nextToClose, children }) {
  return (
    <OuterContainer onClick={onClose}>
      <InnerContainer>
        <CloseRow>
          {nextToClose}
          <div className="ml-2" onClick={onClose}>
            <SvgIcon color="black" icon="close" size="1.5rem" />
          </div>
        </CloseRow>
        {children}
      </InnerContainer>
    </OuterContainer>
  );
}
