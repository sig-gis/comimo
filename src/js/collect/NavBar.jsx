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
    return num <= 0 ? "1" : `${num}`;
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
        buttonText={collect?.go}
        clickHandler={() => {
          goToPlot(currentPlotNumber());
          setPlotNumberToGo(null);
        }}
      />
    </>
  );

  return (
    <ButtonRowOuter>
      <ButtonRowInner>
        {currentPlotId === -1 ? (
          renderGoToPlot()
        ) : (
          <>
            <Button buttonText={collect?.prev} clickHandler={prevPlot} />
            <Button
              buttonText={collect?.mina}
              clickHandler={() => setPlotAnswer("Mina")}
              extraStyle={{ backgroundColor: "#ff6654" }}
            />
            <Button
              buttonText={collect?.noMina}
              clickHandler={() => setPlotAnswer("No Mina")}
              extraStyle={{ backgroundColor: "#00dca0" }}
            />
            <Button buttonText={collect?.next} clickHandler={nextPlot} />
            {renderGoToPlot()}
            <Button
              buttonText={collect?.exit}
              clickHandler={() => {
                window.location.assign("/");
              }}
            />
          </>
        )}
      </ButtonRowInner>
    </ButtonRowOuter>
  );
}
