import React from "react";
import styled from "@emotion/styled";

const Label = styled.h2`
  background-color: ${({ background }) => background};
  color: ${({ textColor }) => textColor};
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium)
    var(--unnamed-font-size-18) / 20px var(--unnamed-font-family-roboto);
  letter-spacing: var(--unnamed-character-spacing-0);
  padding: 10px 0 7.5px 10px;
  text-align: left;
`;

const HeaderLabel = ({ background, extraStyle, textColor, children }) => (
  <Label style={extraStyle} background={background} textColor={textColor}>
    {children}
  </Label>
);

export default HeaderLabel;
