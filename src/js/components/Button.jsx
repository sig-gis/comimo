import React from "react";
import styled from "@emotion/styled";
import { THEME } from "../constants";

const ButtonStyled = styled.button`
  background-color: ${({ $active, $disabled, $secondaryButton }) => {
    if ($disabled) {
      return THEME.buttonDisabled.backgroundColor;
    } else if ($secondaryButton) {
      return $active
        ? THEME.secondaryButtonSelected.backgroundColor
        : THEME.secondaryButtonDefault.backgroundColor;
    } else {
      return $active
        ? THEME.primaryButtonSelected.backgroundColor
        : THEME.primaryButtonDefault.backgroundColor;
    }
  }};
  border-color: ${({ $active, $disabled, $secondaryButton }) => {
    if ($disabled) {
      return THEME.buttonDisabled.borderColor;
    } else if ($secondaryButton) {
      return $active
        ? THEME.secondaryButtonSelected.borderColor
        : THEME.secondaryButtonDefault.borderColor;
    } else {
      return $active
        ? THEME.primaryButtonSelected.borderColor
        : THEME.primaryButtonDefault.borderColor;
    }
  }};
  border: 1px solid;
  border-radius: 0.25rem;
  color: ${({ $active, $disabled, $secondaryButton }) => {
    if ($disabled) {
      return THEME.buttonDisabled.fillColor;
    } else if ($secondaryButton) {
      return $active
        ? THEME.secondaryButtonSelected.fillColor
        : THEME.secondaryButtonDefault.fillColor;
    } else {
      return $active ? THEME.primaryButtonSelected.fillColor : THEME.primaryButtonDefault.fillColor;
    }
  }};
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  font-style: var(--unnamed-font-family-roboto);
  font-size: 18px;
  font-weight: var(--unnamed-font-weight-medium);
  letter-spacing: 0px;
  line-height: 1.5;
  max-height: 37px;
  padding: 0.2rem 0.5rem;
  pointer-events: ${({ $disabled }) => ($disabled ? "none" : "all")}
  text-align: center;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
  vertical-align: middle;

  &:hover {
    background-color: ${({ $disabled, $secondaryButton }) => {
      if ($disabled) {
        return THEME.buttonDisabled.backgroundColor;
      } else if ($secondaryButton) {
        return THEME.secondaryButtonHover.backgroundColor;
      } else {
        return THEME.primaryButtonHover.backgroundColor;
      }
    }};
    border-color: ${({ $disabled, $secondaryButton }) => {
      if ($disabled) {
        return THEME.buttonDisabled.borderColor;
      } else if ($secondaryButton) {
        return THEME.secondaryButtonHover.borderColor;
      } else {
        return THEME.primaryButtonHover.borderColor;
      }
    }};
    color: ${({ $disabled, $secondaryButton }) => {
      if ($disabled) {
        return THEME.buttonDisabled.fillColor;
      } else if ($secondaryButton) {
        return THEME.secondaryButtonHover.fillColor;
      } else {
        return THEME.primaryButtonHover.fillColor;
      }
    }};
  }
`;

function Button({
  active,
  buttonText,
  clickHandler,
  extraStyle,
  isDisabled,
  secondaryButton,
  tooltip,
}) {
  return (
    <ButtonStyled
      style={extraStyle}
      $active={active}
      $disabled={isDisabled}
      disabled={isDisabled}
      $secondaryButton={secondaryButton || false}
      onClick={clickHandler}
      title={tooltip}
    >
      {buttonText}
    </ButtonStyled>
  );
}

export default Button;
