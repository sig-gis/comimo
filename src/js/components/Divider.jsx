import React from "react";
import { css } from "@emotion/react";

const Divider = ({}) => (
  <div
    css={css`
      border-top: 1px dashed;
      border-color: var(--gray);
      margin: 8px 0;
    `}
  />
);

export default Divider;
