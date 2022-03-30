import React from "react";
import styled from "styled-components";

import SvgIcon from "./SvgIcon";

const OuterContainer = styled.div`
  position: fixed;
  height: 100%;
  width: 100%;
  padding: 0;
  margin: 0;
  top: 0;
  left: 0;
  z-index: 99;
  background: #0000009e;

  &.p {
   white-space: pre-wrap;
  }
`;

const InnerContainer = styled.div`
  border-radius: 5px;
  margin: 50px auto;
  left: 0;
  right: 0;
  max-width: 40rem;
  width: 90%;
  height: 80%;
  padding: 1.5rem;
  background: white;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CloseRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export default function InfoModal({onClose, nextToClose, children}) {
  return (
    <OuterContainer onClick={onClose}>
      <InnerContainer>
        <CloseRow>
          {nextToClose}
          <div
            className="ml-2"
            onClick={onClose}
          >
            <SvgIcon color="black" icon="close" size="1.5rem"/>
          </div>
        </CloseRow>
        {children}
      </InnerContainer>
    </OuterContainer>
  );
}
