import React from "react";
import styled from "@emotion/styled";

import SvgIcon from "./SvgIcon";

const StyledButton = styled.button`
  background: ${({$active}) => ($active ? "#80808088" : "inherit")};
  border: 0;
  height: fit-content;
  width: 50px;
  margin: 0;
  padding: 0;

  @media only screen and (orientation: portrait) {
    display: inline-block;
    text-align: center;
    height: 75px;
    width: 75px;
    white-space: normal;
  }
`;

export default function SideIcon({parentClass, clickHandler, tooltip, icon, subtext, active}) {
  return (
    <StyledButton
      $active={active}
      className={parentClass || ""}
      onClick={clickHandler}
      title={tooltip}
    >
      <div style={{padding: "6px", display: "flex", justifyContent: "center"}}>
        <SvgIcon color="#003333" icon={icon} size="38px"/>
      </div>
      {subtext && <span className="advanced-text mb-3">{subtext}</span>}
    </StyledButton>
  );
}
