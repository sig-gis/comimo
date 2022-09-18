import React from "react";
import styled from "@emotion/styled";
import { THEME } from "../constants";

// Background color

const getBackgroundColor = ({ $active, $backgroundColor, $disabled, $secondaryButton }) => {
  if ($backgroundColor) {
    return $backgroundColor;
  } else if ($disabled) {
    return THEME.disabled.backgroundColor;
  } else if ($secondaryButton) {
    return $active
      ? THEME.active.secondaryButton.backgroundColor
      : THEME.default.secondaryButton.backgroundColor;
  } else {
    return $active
      ? THEME.active.standardButton.backgroundColor
      : THEME.default.standardButton.backgroundColor;
  }
};

const getBackgroundColorHover = ({ $backgroundColorHover, $disabled, $secondaryButton }) => {
  if ($backgroundColorHover) {
    return $backgroundColorHover;
  } else if ($disabled) {
    return THEME.disabled.backgroundColor;
  } else if ($secondaryButton) {
    return THEME.hover.secondaryButton.backgroundColor;
  } else {
    return THEME.hover.standardButton.backgroundColor;
  }
};

// Border color

const getBorderColor = ({ $active, $disabled, $secondaryButton }) => {
  if ($disabled) {
    return THEME.disabled.borderColor;
  } else if ($secondaryButton) {
    return $active
      ? THEME.active.secondaryButton.borderColor
      : THEME.default.secondaryButton.borderColor;
  } else {
    return $active
      ? THEME.active.standardButton.borderColor
      : THEME.default.standardButton.borderColor;
  }
};

const getBorderColorHover = ({ $disabled, $secondaryButton }) => {
  if ($disabled) {
    return THEME.disabled.borderColor;
  } else if ($secondaryButton) {
    return THEME.hover.secondaryButton.borderColor;
  } else {
    return THEME.hover.standardButton.borderColor;
  }
};

// Fill color

const getFillColor = ({ $active, $fillColor, $disabled, $secondaryButton }) => {
  if ($fillColor) {
    return $fillColor;
  } else if ($disabled) {
    return THEME.disabled.fillColor;
  } else if ($secondaryButton) {
    return $active
      ? THEME.active.secondaryButton.fillColor
      : THEME.default.secondaryButton.fillColor;
  } else {
    return $active ? THEME.active.standardButton.fillColor : THEME.default.standardButton.fillColor;
  }
};

const getFillColorHover = ({ $disabled, $fillColorHover, $secondaryButton }) => {
  if ($fillColorHover) {
    return $fillColorHover;
  } else if ($disabled) {
    return THEME.disabled.fillColor;
  } else if ($secondaryButton) {
    return THEME.hover.secondaryButton.fillColor;
  } else {
    return THEME.hover.standardButton.fillColor;
  }
};

const ButtonStyled = styled.button`
  background-color: ${getBackgroundColor};
  border-color: ${getBorderColor};
  border: 1px solid;
  border-radius: 4px;
  box-shadow: ${({ $active, $disabled }) =>
    $active || $disabled ? "none" : "0px 2px 4px #00000050"};
  color: ${getFillColor};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium)
    var(--unnamed-font-size-18) / 21px var(--unnamed-font-family-roboto);
  letter-spacing: 0px;
  line-height: 1.5;
  padding: 0.2rem 0.5rem;
  text-align: center;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
  vertical-align: middle;

  &:hover {
    background-color: ${getBackgroundColorHover};
    border-color: ${getBorderColorHover};
    box-shadow: none;
    color: ${getFillColorHover};
  }
`;

function Button({
  active,
  backgroundColor,
  backgroundColorHover,
  children,
  extraStyle,
  fillColor,
  fillColorHover,
  isDisabled,
  onClick,
  secondaryButton,
  tooltip,
}) {
  return (
    <ButtonStyled
      style={extraStyle}
      $active={active}
      $backgroundColor={backgroundColor}
      $backgroundColorHover={backgroundColorHover}
      $fillColor={fillColor}
      $fillColorHover={fillColorHover}
      $disabled={isDisabled}
      disabled={isDisabled}
      $secondaryButton={secondaryButton || false}
      onClick={onClick}
      title={tooltip}
    >
      {children}
    </ButtonStyled>
  );
}

export default Button;
