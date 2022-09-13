import React from "react";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

import Button from "../components/Button";
import ToolCard from "../components/ToolCard";

const Warning = styled.span`
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-normal)
    var(--unnamed-font-size-16) / var(--unnamed-line-spacing-19) var(--unnamed-font-family-roboto);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--black);
  text-align: left;
`;

export default function CollectDownload({ active, currentPlot, currentPlotId, projectId }) {
  const { t } = useTranslation();

  const geomToKML = (geom) => {
    const coordinates = geom.coordinates[0];
    const strCoords = coordinates.map((c) => c.join(",")).join(" ");
    return (
      '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd"><Document><Placemark><Polygon><outerBoundaryIs><LinearRing><coordinates>' +
      strCoords +
      "</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>"
    );
  };

  return (
    <ToolCard title={t("layers.title")} active={active}>
      {currentPlot?.geom ? (
        // TODO change to <Button> component
        <a
          download={"comimo_projectId-" + projectId + "_plotId-" + currentPlotId + ".kml"}
          href={
            "data:earth.kml+xml application/vnd.google-earth.kmz, " +
            encodeURIComponent(geomToKML(currentPlot?.geom))
          }
        >
          {t("collect.download")}
        </a>
      ) : (
        <Warning>{t("collect.selectPlot")}</Warning>
      )}
    </ToolCard>
  );
}
