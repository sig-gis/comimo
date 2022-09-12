import React from "react";

import IconButton from "./IconButton";

function DeleteButton({ onClick }) {
  return (
    <IconButton
      extraStyle={{ borderColor: "red" }}
      bgColorHover="#ff40409e"
      size="15px"
      icon="redX"
      tooltip="remove"
      onClick={onClick}
    />
  );
}

export default DeleteButton;
