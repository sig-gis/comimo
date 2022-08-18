import React from "react";
import styled from "@emotion/styled";
import { THEME } from "../constants";

import IconButton from "./IconButton";

const OuterButton = styled.button`
  align-items: center;
  background-color: ${({ $background }) => ($background ? "#434343" : "transparent")};
  box-shadow: 0px 3px 6px #00000029;
  border-radius: ${({ $invertBorderRadius }) =>
    $invertBorderRadius ? "6px 6px 0px 0px" : "0px 0px 6px 6px"};
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: space-between;
`;

const ButtonLabel = styled.span`
  color: var(--white);
  font-size: 18px;
  font-weight: var(--unnamed-font-weight-medium);
  letter-spacing: 0px;
  padding: 0 0.5rem;
  text-align: left;
  text-decoration: ${({ $active }) => ($active ? "underline" : "none")};

  // TODO: The icon and the label should both have the same hover state when
  // the outer div is hovered over
  &:hover {
    text-decoration: underline;
  }
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
    <OuterButton
      $background={hasBackground}
      $invertBorderRadius={invertBorderRadius || false}
      onClick={clickHandler}
      title={tooltip}
    >
      {/* TODO: The active state is not working when passing it here to IconButton, not sure why */}
      <IconButton $active={active} icon={icon} size={iconSize} />
      <ButtonLabel $active={active}>{text}</ButtonLabel>
    </OuterButton>
  );
}

export default IconTextButton;
