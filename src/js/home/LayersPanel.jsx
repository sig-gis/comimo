import React, { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import styled from "@emotion/styled";

import NICFIControl from "../components/NICFIControl";
import ToolCard from "../components/ToolCard";

// import i18n from "../i18n";
import { extraMapParamsAtom } from "../home";
import { startVisible, availableLayers, layerColors } from "../constants";
import { homeMapAtom } from "./HomeMap";
import { useTranslation } from "react-i18next";

const LayerCheckbox = styled.input`
  accent-color: ${({ layerColor }) => layerColor || "var(--teal-1)"};
`;

const LayerSlider = styled.input`
  background: ${({ layerColor }) =>
    layerColor
      ? `transparent linear-gradient(90deg, var(--gray-4) 0%, ${layerColor} 100%) 0% 0% no-repeat padding-box`
      : "transparent linear-gradient(90deg, var(--gray-4) 0%, var(--black) 100%) 0% 0% no-repeat padding-box"};

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    background: ${({ layerColor }) => layerColor || "var(--teal-1)"};
    border: 2px solid;
    border-color: var(--white);
    border-radius: 50%;
    box-shadow: 0px 3px 2px #00000040;
    cursor: ew-resize;
    height: 18px;
    width: 18px;
  }

  &::-moz-range-thumb {
    background: ${({ layerColor }) => layerColor || "var(--teal-1)"};
    border: 2px solid;
    border-color: var(--white);
    border-radius: 50%;
    box-shadow: 0px 3px 2px #00000040;
    cursor: ew-resize;
    height: 18px;
    width: 18px;
  }
`;

export default function LayersPanel({ nicfiLayers, active }) {
  const [visible, setVisible] = useState(null);
  const [extraMapParams, setExtraMapParams] = useAtom(extraMapParamsAtom);
  const [opacity, setOpacity] = useState(null);
  const homeMap = useAtomValue(homeMapAtom);

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
    homeMap.setLayoutProperty(name, "visibility", layerVisible ? "visible" : "none");
    setVisible({ ...visible, [name]: layerVisible });
  };

  const setLayerOpacity = (name, newOpacity) => {
    homeMap.setPaintProperty(name, "raster-opacity", newOpacity / 100);
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
        <label style={{ fontWeight: "bold", margin: "0 .25rem 0 0" }}>
          {t("layers.nameLabel")}
        </label>
        <label style={{ fontWeight: "bold", margin: "0 .25rem", width: "40%" }}>
          {t("layers.opacityLabel")}
        </label>
      </div>
      <hr style={{ marginBottom: "0.5rem" }}></hr>
    </>
  );

  const renderNICFISection = () => (
    <>
      <label style={{ fontWeight: "bold", margin: "0 .25rem 0 0" }}>
        {t("layers.satelliteTitle")}
      </label>
      <hr style={{ marginBottom: "0.5rem" }}></hr>
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
      {renderHeading()}
      {opacity &&
        visible &&
        availableLayers.map((layerName) => (layerName === "NICFI" ? "" : renderControl(layerName)))}
      <br></br>
      {opacity && visible && renderNICFISection()}
    </ToolCard>
  );
}
