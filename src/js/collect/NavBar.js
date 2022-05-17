import React, {useState} from "react";

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

export default function NavBar({currentPlotId, goToPlot, nextPlot, prevPlot, setPlotAnswer}) {
  const [targetPlotNumber, setTargetPlotNumber] = useState(null);
  return (
    <ButtonRowOuter>
      <ButtonRowInner>
        {currentPlotId === -1
          ? <Button onClick={nextPlot}>Go To First Plot</Button>
          : (
            <>
              <Button onClick={prevPlot}>Prev</Button>
              <Button
                $type="mina"
                onClick={() => setPlotAnswer("Mina")}
              >
                Mina
              </Button>
              <Button
                $type="noMina"
                onClick={() => setPlotAnswer("No Mina")}
              >
                No Mina
              </Button>
              <input
                autoComplete="off"
                className="col-2 ml-1"
                id="plotId"
                onChange={e => {
                  setTargetPlotNumber(e.target.value);
                }}
                onKeyDown={() => goToPlot(targetPlotNumber)}
                type="number"
                value={targetPlotNumber}
              />
              <Button
                onClick={() => {
                  goToPlot(targetPlotNumber);
                }}
                type="button"
              >
                Go
              </Button>

              <Button onClick={nextPlot}>Next</Button>
            </>
          )}
      </ButtonRowInner>
    </ButtonRowOuter>
  );
}
