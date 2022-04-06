import React from "react";
import styled from "styled-components";
import Button from "../components/Button";

const ButtonRowOuter = styled.div`
  bottom: 32px;
  display: flex;
  justify-content: center;
  position: fixed;
  width: 100%;
  z-index: 10000;
`;

const ButtonRowInner = styled.div`
  align-items: center;
  display: flex;

  button {
    margin-right: 1rem;

    &:last-child {
      margin-right: 0rem;
    }
  }
`;

export default function NavBar({currentPlotId, nextPlot, prevPlot}) {
  return (
    <ButtonRowOuter>
      <ButtonRowInner>
        {currentPlotId === -1
          ? <Button onClick={nextPlot}>Go To First Plot</Button>
          : (
            <>
              <Button onClick={prevPlot}>Prev</Button>
              <Button>Mina</Button>
              <Button>No Mina</Button>
              <Button>Save</Button>
              <Button onClick={nextPlot}>Next</Button>
            </>
          )}
      </ButtonRowInner>
    </ButtonRowOuter>
  );
}
