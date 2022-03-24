import React from "react";
import styled from "styled-components";

const CardOuter = styled.div`
  border: 2px solid black;
  border-radius: 4px;
  overflow: hidden;
  width: 25rem;
`;

const CardInner = styled.div`
  padding: 1rem;
`;

const CardHeader = styled.h2`
  background-color: #f0ad4e;
  border-bottom: 2px solid black;
  font-size: larger;
  margin: -1px;
  padding: 1rem;
`;

export default function Card({header, children}) {
  return (
    <CardOuter>
      {header && (
        <CardHeader>
          {header}
        </CardHeader>
      )}
      <CardInner>
        {children}
      </CardInner>
    </CardOuter>
  );
}
