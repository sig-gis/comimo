import React from "react";
import styled from "@emotion/styled";

import IconTextButton from "./IconTextButton";

const Hidable = styled.div`
  display: ${({ active }) => !active && "none"};
`;

export default function MenuItem({ icon, selectedItem, itemName, onClick, tooltip, children }) {
  const active = selectedItem === itemName;
  return (
    <>
      <IconTextButton
        active={selectedItem === itemName}
        icon={icon || itemName}
        onClick={() => onClick(itemName)}
        tooltip={tooltip}
      />
      <Hidable active={active}>{children}</Hidable>
    </>
  );
}
