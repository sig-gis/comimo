import React from "react";
import styled from "@emotion/styled";

const FooterBarContainer = styled.div`
  background-color: var(--gray-1);
  box-shadow: 3px 0px 6px #0000008d;
  display: flex;
  height: var(--bar-height);
  justify-content: space-between;
  text-align: center;
  width: 100%;
`;

export default function FooterBar({ children }) {
  return <FooterBarContainer id="footer-bar">{children}</FooterBarContainer>;
}
