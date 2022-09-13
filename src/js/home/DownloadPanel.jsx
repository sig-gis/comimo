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

export default function DownloadPanel({ active, featureNames, mapquestKey, selectedDates }) {
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const [selectedRegion, setSelectedRegion] = useAtom(selectedRegionAtom);
  const homeMap = useAtomValue(homeMapAtom);

  const [clipOption, setClipOption] = useState(1);
  const [downloadURL, setDownloadURL] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [mineType, setMineType] = useState("cMines");

  const { t } = useTranslation();

  const getDownloadUrl = () => {
    const region = clipOption === 1 ? "all" : selectedRegion;

    processModal(
      () =>
        jsonRequest(URLS.GET_DL_URL, {
          region,
          dataLayer: selectedDates[mineType],
        })
          .then((resp) => {
            setDownloadURL([region, selectedDates[mineType], resp]);
          })
          .catch((err) => {
            console.error(err);
          }),
      setShowModal
    );
  };

  return (
    <ToolCard title={t("download.title")} active={active}>
      {showModal && <LoadingModal message="Getting URL" />}
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
            onChange={() => setClipOption(1)}
            type="radio"
          />
          <label style={{ cursor: "pointer" }} htmlFor="completeData">
            {t("download.allRadio")}
          </label>
        </div>
        {/* TODO: disabled-group is not defined yet */}
        <div
          className={selectedRegion ? "" : "disabled-group"}
          style={{ cursor: "pointer", marginTop: ".25rem" }}
        >
          <input
            id="selectedMunicipality"
            style={{ cursor: "pointer" }}
            checked={clipOption === 2}
            name="downloadRegion"
            onChange={() => setClipOption(2)}
            type="radio"
          />
          <label style={{ cursor: "pointer" }} htmlFor="selectedMunicipality">
            {t("download.selectedRadio")}
          </label>
        </div>
        <Divider />
        <div>
          <Search
            isPanel={false}
            featureNames={featureNames}
            map={homeMap}
            mapquestKey={mapquestKey}
            setSelectedRegion={setSelectedRegion}
          ></Search>
        </div>
        {/* TODO download text is too large for button sometimes, either truncate it or wrap the text */}
        {selectedDates && (
          <Button
            onClick={getDownloadUrl}
            extraStyle={{ marginTop: "0.25rem" }}
            isDisabled={fetching}
          >{`${t("download.getUrl")} ${selectedDates[mineType]}`}</Button>
        )}
        {fetching ? (
          <p>{`${t("download.fetching")}...`}</p>
        ) : (
          downloadURL && (
            <p>
              <span>
                <a href={downloadURL[2]}>
                  {`${t("download.clickHere")}` +
                    ` ${
                      downloadURL[0] === "all"
                        ? t("download.completeData")
                        : t("download.munData") + downloadURL[0]
                    }` +
                    ` ${t("download.prep")}` +
                    ` ${downloadURL[1]}.`}
                </a>
              </span>
            </p>
          )
        )}
      </div>
    </ToolCard>
  );
}
