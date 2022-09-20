import React, { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

import Button from "../components/Button";
import SvgIcon from "../components/SvgIcon";
import SvgButton from "./SvgButton";
import InputNumber from "./InputNumber";

import { currentPlotNumberAtom, currentPlotIdAtom } from "../collect";

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
`;

export default function NavBar({
  shiftPlotId,
  showAlert,
  goToPlot,
  nextPlot,
  prevPlot,
  setPlotAnswer,
  maxPlotNumber,
}) {
  const [currentPlotId, setCurrentPlotId] = useAtom(currentPlotIdAtom);
  const [currentPlotNumber, setCurrentPlotNumber] = useAtom(currentPlotNumberAtom);

  const { t } = useTranslation();

  // TODO display message when trying to go to invalid plot number
  const renderGoToPlot = () => (
    <>
      <InputNumber
        autoComplete="off"
        id="plotIdInput"
        min="1"
        max="none"
        onChange={(e) => {
          setCurrentPlotNumber(parseInt(e.target.value));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            goToPlot();
          }
        }}
        value={currentPlotNumber + ""}
        onClickIncrease={() => {
          const newNumber = currentPlotNumber + 1;
          if (newNumber <= maxPlotNumber) setCurrentPlotNumber(newNumber);
        }}
        onClickDecrease={() => {
          const newNumber = currentPlotNumber - 1;
          if (newNumber > 0) setCurrentPlotNumber(currentPlotNumber - 1);
        }}
        extraStyle={{ marginRight: "0.5rem" }}
      />
      <Button
        onClick={() => {
          if (currentPlotNumber < 1 || currentPlotNumber > maxPlotNumber) {
            alert(t("validate.invalidPlot"));
          }
          goToPlot();
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
                onClick={() => {
                  showAlert({
                    body: t("collect.leaveCollect"),
                    closeText: t("report.cancel"),
                    confirmText: t("report.imSure"),
                    onConfirm: () => window.location.assign("/"),
                    title: t("collect.returnHome"),
                  });
                }}
                extraStyle={{ marginLeft: "2rem" }}
              />
            </>
          )}
        </ButtonRowInner>
      </ButtonRowOuter>
    </ButtonContainer>
  );
}
