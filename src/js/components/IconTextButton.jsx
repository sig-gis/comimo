import React from "react";
import styled from "@emotion/styled";
import { THEME } from "../constants";

import IconButton from "./IconButton";

const Container = styled.button`
  align-items: center;
  background-color: ${({ $background }) => ($background ? "#434343" : "transparent")};
  box-shadow: 0px 3px 6px #00000029;
  border-radius: ${({ $invertBorderRadius }) =>
    $invertBorderRadius ? "6px 6px 0px 0px" : "0px 0px 6px 6px"};
  color: var(--white);
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: space-between;
  text-decoration: ${({ $active }) => ($active ? "underline" : "none")};

  &:hover {
    text-decoration: underline;
`;

const Label = styled.span`
  color: var(--white);
  font-size: 18px;
  font-weight: var(--unnamed-font-weight-medium);
  letter-spacing: 0px;
  padding: 0 0.5rem;
  text-align: left;
`;

function IconTextButton({
  active,
  clickHandler,
  hasBackground,
  icon,
  iconSize,
  invertBorderRadius,
  text,
  tooltip,
}) {
  return (
    <Container
      $background={hasBackground}
      $invertBorderRadius={invertBorderRadius || false}
      onClick={clickHandler}
      title={tooltip}
    >
      {/* TODO: The active state is not working when passing it here to IconButton, not sure why */}
      <IconButton $active={active} icon={icon} size={iconSize} />
      <Label $active={active}>{text}</Label>
    </Container>
  );
}

export default IconTextButton;
