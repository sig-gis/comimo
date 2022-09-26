import React from "react";

import IconButton from "./IconButton";

const DeleteButton = ({ onClick }) => (
  <IconButton
    extraStyle={{ borderColor: "red" }}
    bgColorHover="#ff40409e"
    color="var(--error-red)"
    size="12px"
    icon="x"
    tooltip="remove"
    onClick={onClick}
  />
);

export default DeleteButton;
