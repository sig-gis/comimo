import React, { useState, useContext } from "react";
import styled from "@emotion/styled";

import Button from "../components/Button";
import { MainContext } from "../components/PageLayout";

const ButtonRowOuter = styled.div`
  bottom: 32px;
  margin-left: 50px;
  display: flex;
  justify-content: center;
  position: fixed;
  text-align: center;
  width: 100%;
  z-index: 10000;
`;

const ButtonRowInner = styled.div`
  align-items: center;
  display: inline-block;
  display: flex;

  button {
    margin-right: 1rem;

    &:last-child {
      margin-right: 0rem;
    }
  }
`;

const PlotNumberInput = styled.input`
  margin-left: 1rem;
  width: 3em;
`;

export default function NavBar({
  currentPlotId,
  shiftPlotId,
  goToPlot,
  nextPlot,
  prevPlot,
  setPlotAnswer,
}) {
  const {
    localeText: { collect },
  } = useContext(MainContext);
  const [plotNumberToGo, setPlotNumberToGo] = useState(null);

  const currentPlotNumber = () => {
    let num = plotNumberToGo || currentPlotId - shiftPlotId + 1;
    return num <= 0 ? 1 : num;
  };

  const renderGoToPlot = () => (
    <>
      <PlotNumberInput
        autoComplete="off"
        id="plotId"
        min="1"
        onChange={(e) => setPlotNumberToGo(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            goToPlot(currentPlotNumber());
            setPlotNumberToGo(null);
          }
        }}
        type="number"
        value={currentPlotNumber()}
      />
      <Button
        onClick={() => {
          goToPlot(currentPlotNumber());
          setPlotNumberToGo(null);
        }}
      >
        {collect?.go}
      </Button>
    </>
  );

  return (
    <ButtonRowOuter>
      <ButtonRowInner>
        {currentPlotId === -1 ? (
          renderGoToPlot()
        ) : (
          <>
            <Button onClick={prevPlot}>Prev</Button>
            <Button $type="mina" onClick={() => setPlotAnswer("Mina")}>
              {collect?.mina}
            </Button>
            <Button $type="noMina" onClick={() => setPlotAnswer("No Mina")}>
              {collect?.noMina}
            </Button>
            <Button onClick={nextPlot}>{collect?.next}</Button>
            {renderGoToPlot()}
            <Button
              onClick={() => {
                window.location.assign("/");
              }}
            >
              {collect?.exit}
            </Button>
          </>
        )}
      </ButtonRowInner>
    </ButtonRowOuter>
  );
}
