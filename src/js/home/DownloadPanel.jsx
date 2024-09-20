import React, { useState } from "react";
import styled from "@emotion/styled";
import { useAtom, useAtomValue } from "jotai";

import Button from "../components/Button";
import Search from "../components/Search";
import Select from "../components/Select";
import ToolCard from "../components/ToolCard";
import Divider from "../components/Divider";

import LoadingModal from "../components/LoadingModal";
import { URLS } from "../constants";
import { jsonRequest } from "../utils";

import { processModal, showModalAtom } from "../../../src/js/home";
import { homeMapAtom, selectedRegionAtom } from "./HomeMap";
import { useTranslation } from "react-i18next";

const Label = styled.label`
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium)
    var(--unnamed-font-size-16) / var(--unnamed-line-spacing-19) var(--unnamed-font-family-roboto);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--black);
  text-align: left;
`;

export default function DownloadPanel({ active, featureNames, selectedDates }) {
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const [selectedRegion, setSelectedRegion] = useAtom(selectedRegionAtom);
  const homeMap = useAtomValue(homeMapAtom);

  const [clipOption, setClipOption] = useState(1);
  const [downloadURL, setDownloadURL] = useState(false);
  const [format, setFormat] = useState("CSV");
  const [fetching, setFetching] = useState(false);
  const [mineType, setMineType] = useState("cMines");

  const { t } = useTranslation();

  const getDownloadUrl = () => {
    const region = clipOption === 1 ? "all" : selectedRegion;

    processModal(
      () =>
        jsonRequest("get-download-url", {
          region,
          dataLayer: selectedDates[mineType],
        })
          .then((resp) => {
            setDownloadURL({
              region,
              alertsLayer: selectedDates[mineType],
              csvURL: resp.csvUrl,
              kmlURL: resp.kmlUrl,
            });
          })
          .catch((err) => {
            console.error(err);
          }),
      setShowModal
    );
  };

  const handleFormatChange = (event) => {
    setFormat(event.target.value);
  };

  return (
    <ToolCard title={t("download.title")} active={active}>
      {showModal && <LoadingModal message={t("download.gettingUrl")} />}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Label>{`${t("validate.typeLabel")}:`}</Label>
        <Select
          id="selectMineType"
          onChange={(e) => setMineType(e.target.value)}
          options={["pMines", "nMines", "cMines"].map((k) => ({
            value: k,
            label: t(`validate.${k}`),
          }))}
          value={mineType}
        />
        <div style={{ cursor: "pointer", marginTop: ".25rem" }}>
          <input
            style={{ cursor: "pointer" }}
            id="completeData"
            checked={clipOption === 1}
            name="downloadRegion"
            onChange={() => {
              setClipOption(1);
              setDownloadURL(false);
            }}
            type="radio"
          />
          <label style={{ cursor: "pointer" }} htmlFor="completeData">
            {t("download.allRadio")}
          </label>
        </div>
        <div style={{ cursor: "pointer", marginTop: ".25rem" }}>
          <input
            id="selectedMunicipality"
            style={{ cursor: "pointer" }}
            checked={clipOption === 2}
            name="downloadRegion"
            onChange={() => {
              setClipOption(2);
              setDownloadURL(false);
            }}
            type="radio"
          />
          <label style={{ cursor: "pointer" }} htmlFor="selectedMunicipality">
            {t("download.selectedRadio")}
          </label>
        </div>
        {clipOption === 2 && (
          <>
            <Divider />
            <div>
              <Search
                isPanel={false}
                featureNames={featureNames}
                theMap={homeMap}
              ></Search>
            </div>
          </>
        )}
        {((clipOption === 1 && selectedDates) ||
          (clipOption === 2 && selectedDates && selectedRegion)) && (
          <Button
            onClick={getDownloadUrl}
            extraStyle={{ marginTop: "0.25rem" }}
            isDisabled={fetching}
          >{`${t("download.getUrl")} ${selectedDates[mineType]}`}</Button>
        )}
        {fetching ? (
          <p>{`${t("download.fetching")}...`}</p>
        ) : (
          downloadURL &&
          downloadURL.region && (
            <div>
              <div style={{ display: "flex" }}>
                <label style={{ display: "inline-block" }}>
                  <input
                    type="radio"
                    value="CSV"
                    checked={format === "CSV"}
                    onChange={handleFormatChange}
                  />
                  CSV
                </label>
                <label style={{ display: "inline-block" }}>
                  <input
                    type="radio"
                    value="KML"
                    checked={format === "KML"}
                    onChange={handleFormatChange}
                  />
                  KML
                </label>
              </div>
              <span>
                <a href={format === "CSV" ? downloadURL.csvURL : downloadURL.kmlURL}>
                  {`${t("download.clickHere")}` +
                    ` ${
                      downloadURL.region === "all"
                        ? t("download.completeData")
                        : t("download.munData") + downloadURL.region.split("_").slice(1).join(", ")
                    }` +
                    ` ${t("download.prep")}` +
                    ` ${downloadURL.alertsLayer}.`}
                </a>
              </span>
            </div>
          )
        )}
      </div>
    </ToolCard>
  );
}
