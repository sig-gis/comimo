import React from "react";
import styled from "@emotion/styled";
import { THEME } from "../constants";

import SvgIcon from "./SvgIcon";

const StyledButton = styled.button`
  background-color: ${({ $active }) =>
    $active ? THEME.active.iconButton.backgroundColor : THEME.default.iconButton.backgroundColor};
  border-color: ${({ $active }) =>
    $active ? THEME.active.iconButton.borderColor : THEME.default.iconButton.borderColor};
  border-radius: 50%;
  border-style: solid;
  border-width: 1px;
  cursor: pointer;
  height: fit-content;
  margin: 5px 0 5px 10px;
  padding: 0;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;

  &:hover {
    background-color: ${({ $bgColorHover }) =>
      $bgColorHover || THEME.hover.iconButton.backgroundColor};
    border-color: ${THEME.hover.iconButton.borderColor};
  }
`;

const SvgContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 6px;
`;

function IconButton({
  active,
  bgColorHover,
  icon,
  extraStyle,
  onClick,
  parentClass,
  size,
  tooltip,
}) {
  return (
    <StyledButton
      style={extraStyle}
      $active={active}
      $bgColorHover={bgColorHover}
      className={parentClass || ""}
      onClick={onClick}
      title={tooltip}
    >
      <SvgContainer>
        <SvgIcon color={THEME.default.iconButton.fillColor} icon={icon} size={size || "26px"} />
      </SvgContainer>
    </StyledButton>
  );
}

export default IconButton;
