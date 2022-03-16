import React from "react";

import SideIcon from "./SideIcon";

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
      {active && children}
    </>
  );
}
