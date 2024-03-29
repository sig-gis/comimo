import React, { useState } from "react";
import styled from "@emotion/styled";

import IconButton from "./IconButton";

const Container = styled.div`
  align-items: center;
  background-color: ${({ $background }) => ($background ? "#434343" : "transparent")};
  box-shadow: ${({ $background }) => ($background ? "0px 3px 6px #00000029" : "none")};
  border-radius: ${({ $invertBorderRadius }) =>
    $invertBorderRadius ? "6px 6px 0px 0px" : "0px 0px 6px 6px"};
  color: var(--white);
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: space-between;
  text-decoration: ${({ $active }) => ($active ? "underline" : "none")};
  transition: text-decoration 0.15s ease-in-out;

  &:hover {
    text-decoration: underline;
  }

  @media only screen and (max-width: 1000px) {
    background-color: transparent;
  }
`;

const Label = styled.span`
  color: var(--white);
  font-size: 16px;
  font-weight: var(--unnamed-font-weight-medium);
  letter-spacing: 0px;
  padding: 0 0.5rem;
  text-align: left;

  @media only screen and (max-width: 1000px) {
    display: none;
  }
`;

export default function IconTextButton({
  active,
  hasBackground,
  extraStyle,
  icon,
  iconSize,
  invertBorderRadius,
  onClick,
  text,
  tooltip,
}) {
  const [hover, setHover] = useState(false);

  return (
    <Container
      $background={hasBackground}
      $invertBorderRadius={invertBorderRadius || false}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={extraStyle}
      title={tooltip}
    >
      <IconButton
        active={hover || active}
        extraStyle={{ marginLeft: "5px" }}
        icon={icon}
        size={iconSize}
      />
      <Label $active={hover}>{text}</Label>
    </Container>
  );
}
