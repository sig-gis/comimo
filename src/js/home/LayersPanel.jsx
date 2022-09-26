import React, { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import NICFIControl from "../components/NICFIControl";
import ToolCard from "../components/ToolCard";
import Divider from "../components/Divider";
import HeaderLabel from "../components/HeaderLabel";
import { extraMapParamsAtom } from "../home";
import { startVisible, availableLayers, miningLayers, layerColors } from "../constants";
import { useTranslation } from "react-i18next";

const Label = styled.label`
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium) 20px/20px
    var(--unnamed-font-family-roboto);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--gray-1);
  text-align: left;
`;

const LayerCheckbox = styled.input`
  accent-color: ${({ layerColor }) => layerColor || "var(--teal-1)"};
`;

const sliderThumb = (layerColor) => css`
  background: ${layerColor || "var(--teal-1)"};
  border: 2px solid;
  border-color: var(--white);
  border-radius: 50%;
  box-shadow: 0px 3px 2px #00000040;
  cursor: ew-resize;
  height: 18px;
  width: 18px;
`;

const LayerSlider = styled.input`
  background: ${({ layerColor }) =>
    layerColor
      ? `transparent linear-gradient(90deg, var(--gray-4) 0%, ${layerColor} 100%) 0% 0% no-repeat padding-box`
      : "transparent linear-gradient(90deg, var(--gray-4) 0%, var(--black) 100%) 0% 0% no-repeat padding-box"};

  /* Chrome/Safari */
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    ${({ layerColor }) => sliderThumb(layerColor)}
  }

  /* Firefox */
  &::-moz-range-thumb {
    ${({ layerColor }) => sliderThumb(layerColor)}
  }
`;

export default function LayersPanel({ nicfiLayers, active, theMap, nicfiOnly }) {
  const [visible, setVisible] = useState(null);
  const [extraMapParams, setExtraMapParams] = useAtom(extraMapParamsAtom);
  const [opacity, setOpacity] = useState(null);

  const { t } = useTranslation();

  const setParams = (param, value) => {
    setExtraMapParams({
      ...extraMapParams,
      [param]: value,
    });
  };

  useEffect(() => {
    setVisible(
      availableLayers.reduce(
        (acc, cur) => ({ ...acc, [cur]: startVisible.includes(cur) || false }),
        {}
      )
    );

    setOpacity(availableLayers.reduce((acc, cur) => ({ ...acc, [cur]: 100 }), {}));
  }, []);

  const setLayerVisible = (name, layerVisible) => {
    theMap.setLayoutProperty(name, "visibility", layerVisible ? "visible" : "none");
    setVisible({ ...visible, [name]: layerVisible });
  };

  const setLayerOpacity = (name, newOpacity) => {
    theMap.setPaintProperty(name, "raster-opacity", newOpacity / 100);
    setOpacity({ ...opacity, [name]: newOpacity });
  };

  const renderControl = (name) => {
    const layerColor = layerColors[name];
    const layerVisible = visible[name];
    return (
      <div
        key={name}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.5rem",
        }}
      >
        <div>
          <LayerCheckbox
            layerColor={layerColor}
            checked={layerVisible}
            id={"label-" + name}
            onChange={() => setLayerVisible(name, !layerVisible)}
            type="checkbox"
            style={{ cursor: "pointer" }}
          />
          <label htmlFor={"label-" + name} style={{ cursor: "pointer", margin: "0 0 3px 0" }}>
            {t(`layers.${name}`)}
          </label>
        </div>
        <LayerSlider
          layerColor={layerColor}
          max="100"
          min="0"
          onChange={(e) => setLayerOpacity(name, parseInt(e.target.value))}
          style={{ padding: "0rem", margin: "0rem", width: "40%" }}
          type="range"
          value={opacity[name]}
        />
      </div>
    );
  };

  const renderHeading = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0rem" }}>
        <Label>{t("layers.nameLabel")}</Label>
        <Label style={{ width: "40%" }}>{t("layers.opacityLabel")}</Label>
      </div>
      <Divider />
    </>
  );

  const renderMiningActivitySection = () => {
    return (
      <>
        <HeaderLabel
          extraStyle={{ margin: "-16px -16px 10px -16px" }}
          background="var(--orange-4)"
          textColor="var(--gray-1)"
        >
          {t("layers.mining")}
        </HeaderLabel>
        {renderHeading()}
        {availableLayers.map(
          (layerName) => miningLayers.includes(layerName) && renderControl(layerName)
        )}
      </>
    );
  };

  const renderOtherLayersSection = () => {
    return (
      <>
        <HeaderLabel
          extraStyle={{ margin: "16px -16px 10px -16px" }}
          background="var(--gray-3)"
          textColor="var(--gray-1)"
        >
          {t("layers.other")}
        </HeaderLabel>
        {renderHeading()}
        {availableLayers.map(
          (layerName) =>
            layerName !== "NICFI" && !miningLayers.includes(layerName) && renderControl(layerName)
        )}
      </>
    );
  };

  const renderNICFISection = () => (
    <>
      <HeaderLabel
        extraStyle={nicfiOnly ? { margin: "-16px -16px 16px -16px" } : { margin: "16px -16px" }}
        background="#426F96"
        textColor="var(--white)"
      >
        {t("layers.NICFI")}
      </HeaderLabel>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {renderControl("NICFI")}
        <NICFIControl
          extraParams={extraMapParams}
          nicfiLayers={nicfiLayers}
          setParams={setParams}
        />
      </div>
    </>
  );

  return (
    <ToolCard title={t("layers.title")} active={active}>
      {!nicfiOnly && opacity && visible && renderMiningActivitySection()}
      {!nicfiOnly && opacity && visible && renderOtherLayersSection()}
      {opacity && visible && renderNICFISection()}
    </ToolCard>
  );
}
