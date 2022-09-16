import React, { useState } from "react";
import styled from "@emotion/styled";

import Button from "../components/Button";
import SvgIcon from "../components/SvgIcon";
import SvgButton from "./SvgButton";
import InputNumber from "./InputNumber";
import { useTranslation } from "react-i18next";

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ButtonRowOuter = styled.div`
  background: #000000c1 0% 0% no-repeat padding-box;
  border: 1px solid;
  border-color: var(--gray-4);
  border-radius: 12px;
  bottom: calc(var(--bar-height) + 32px);
  display: flex;
  justify-content: center;
  padding: 0.75rem 1rem;
  position: fixed;
  text-align: center;
  width: auto;
  z-index: 99;
`;

const ButtonRowInner = styled.div`
  align-items: center;
  display: inline-block;
  display: flex;

  /* button {
    margin-right: 1rem;

    &:last-child {
      margin-right: 0rem;
    }
  } */
`;

export default function NavBar({
  currentPlotId,
  shiftPlotId,
  goToPlot,
  nextPlot,
  prevPlot,
  setPlotAnswer,
}) {
  const [plotNumberToGo, setPlotNumberToGo] = useState(null);

  const { t } = useTranslation();

  const currentPlotNumber = () => {
    let num = plotNumberToGo || currentPlotId - shiftPlotId + 1;
    return num <= 0 ? "1" : `${num}`;
  };

  const renderGoToPlot = () => (
    <>
      <InputNumber
        autoComplete="off"
        id="plotIdInput"
        min="1"
        max="none"
        onChange={(e) => {
          console.log("changed");
          setPlotNumberToGo(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            goToPlot(currentPlotNumber());
            setPlotNumberToGo(null);
          }
        }}
        value={currentPlotNumber()}
        // TODO this increases the number in the input but doesn't actually change the plot number to go to
        onClickIncrease={() => {
          const e = new Event("change");
          const plotIdInput = document.getElementById("plotIdInput");
          plotIdInput.stepUp();
          plotIdInput.dispatchEvent(e);
        }}
        onClickDecrease={() => {
          const e = new Event("change");
          const plotIdInput = document.getElementById("plotIdInput");
          plotIdInput.stepDown();
          plotIdInput.dispatchEvent(e);
        }}
        extraStyle={{ marginRight: "0.5rem" }}
      />
      <Button
        onClick={() => {
          goToPlot(currentPlotNumber());
          setPlotNumberToGo(null);
        }}
        extraStyle={{
          font: "var(--unnamed-font-style-normal) var(--unnamed-font-weight-bold) var(--unnamed-font-size-18)/21px Roboto Condensed",
          height: "40px",
          textTransform: "uppercase",
          width: "42px",
        }}
      >
        {t("collect.go")}
      </Button>
    </>
  );

  return (
    <ButtonContainer>
      <ButtonRowOuter>
        <ButtonRowInner>
          {currentPlotId === -1 ? (
            renderGoToPlot()
          ) : (
            <>
              <SvgButton
                onClick={prevPlot}
                text={t("collect.prev")}
                backgroundColor="var(--white)"
                backgroundColorHover="var(--nav-bar-button)"
                fillColor="black"
                fillColorHover="var(--white)"
                icon="prev"
                iconSize="20px"
                fill="var(--white)"
                extraStyle={{ marginRight: "0.5rem" }}
              />
              <SvgButton
                onClick={nextPlot}
                text={t("collect.next")}
                backgroundColor="var(--white)"
                backgroundColorHover="var(--nav-bar-button)"
                fillColor="black"
                fillColorHover="var(--white)"
                icon="next"
                iconSize="20px"
                fill="var(--white)"
                extraStyle={{ marginRight: "2rem" }}
              />
              <SvgButton
                text={t("collect.noMina")}
                backgroundColor="var(--no-mina)"
                backgroundColorHover="var(--white)"
                fillColor="var(--white)"
                fillColorHover="var(--no-mina)"
                icon="check"
                iconSize="20px"
                onClick={() => setPlotAnswer("No Mina")}
                extraStyle={{ marginRight: "0.5rem" }}
              />
              <SvgButton
                text={t("collect.mina")}
                backgroundColor="var(--mina)"
                backgroundColorHover="var(--white)"
                fillColor="var(--white)"
                fillColorHover="var(--mina)"
                icon="warning"
                iconSize="20px"
                onClick={() => setPlotAnswer("Mina")}
                extraStyle={{ marginRight: "2rem" }}
              />
              {renderGoToPlot()}
              <SvgButton
                text={t("collect.exit")}
                backgroundColor="var(--nav-bar-button)"
                backgroundColorHover="var(--gray-1)"
                fillColor="var(--white)"
                fillColorHover="var(--white)"
                icon="x"
                iconSize="20px"
                onClick={() => window.location.assign("/")}
                extraStyle={{ marginLeft: "2rem" }}
              />
            </>
          )}
        </ButtonRowInner>
      </ButtonRowOuter>
    </ButtonContainer>
  );
}
