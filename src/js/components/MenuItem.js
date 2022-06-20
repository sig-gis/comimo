import React from "react";
import styled from "@emotion/styled";

import SideIcon from "./SideIcon";

const Hidable = styled.div`
  display: ${({active}) => !active && "none"};
`;

export default function MenuItem({icon, selectedItem, itemName, onClick, tooltip, children}) {
  const active = selectedItem === itemName;
  return (
    <>
      <SideIcon
        active={selectedItem === itemName}
        clickHandler={() => onClick(itemName)}
        icon={icon || itemName}
        tooltip={tooltip}
      />
      <Hidable active={active}>
        {children}
      </Hidable>
    </>
  );
}
