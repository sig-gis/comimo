import React from "react";
import PropTypes from "prop-types";
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
  margin: 5px 0;
  padding: 0;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;

  &:hover {
    background-color: ${THEME.hover.iconButton.backgroundColor};
    border-color: ${THEME.hover.iconButton.borderColor};
  }
`;

const SvgContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 6px;
`;

function IconButton({ active, icon, parentClass, clickHandler, size, tooltip }) {
  return (
    <StyledButton
      $active={active}
      className={parentClass || ""}
      onClick={clickHandler}
      title={tooltip}
    >
      <SvgContainer>
        <SvgIcon color={THEME.default.iconButton.fillColor} icon={icon} size={size || "32px"} />
      </SvgContainer>
    </StyledButton>
  );
}

// IconButton.propTypes = {
//   color: PropTypes.string,
//   cursor: PropTypes.string,
//   extraStyles: PropTypes.object,
//   icon: PropTypes.string.isRequired,
//   size: PropTypes.string.isRequired,
//   verticalAlign: PropTypes.string
// };

// IconButton.defaultProps = {
//   color: "currentColor",
//   cursor: "pointer",
//   extraStyles: {},
//   verticalAlign: "middle"
// };

export default IconButton;
