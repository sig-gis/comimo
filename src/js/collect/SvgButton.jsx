import React, { useState } from "react";
import styled from "@emotion/styled";

import Button from "../components/Button";
import SvgIcon from "../components/SvgIcon";

const SvgContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const Label = styled.span`
  /* color: var(--white);
  font-size: 16px;
  font-weight: var(--unnamed-font-weight-medium);
  letter-spacing: 0px;
  padding: 0 0.5rem;
  text-align: left; */
`;

export default function IconTextButton({
  extraStyle,
  backgroundColor,
  backgroundColorHover,
  icon,
  iconSize,
  fill,
  fillColor,
  fillColorHover,
  onClick,
  text,
}) {
  return (
    <div style={extraStyle}>
      <Button
        fillColor={fillColor}
        fillColorHover={fillColorHover}
        backgroundColor={backgroundColor}
        backgroundColorHover={backgroundColorHover}
        onClick={onClick}
        extraStyle={{ height: "40px" }}
      >
        <SvgContainer>
          <SvgIcon
            extraStyle={{ marginRight: "0.25rem" }}
            icon={icon}
            fill={fill}
            size={iconSize}
          ></SvgIcon>
          <Label>{text}</Label>
        </SvgContainer>
      </Button>
    </div>
  );
}
