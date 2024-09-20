import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import _ from "lodash";
import { useAtom, useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import LoginMessage from "./LoginMessage";
import { homeMapAtom, selectedRegionAtom } from "./HomeMap";

import Button from "../components/Button";
import Search from "../components/Search";
import ToolCard from "../components/ToolCard";
import HeaderLabel from "../components/HeaderLabel";
import { renderMessageBox } from "../components/Modal";
import { usernameAtom } from "../components/PageLayout";

import { URLS } from "../constants";
import { jsonRequest } from "../utils";

export default function SubscribePanel({
  featureNames,
  subscribedList,
  setSubscribedList,
  active,
}) {
  const [subsLoaded, setSubsLoaded] = useState(false);
  const selectedRegion = useAtomValue(selectedRegionAtom);
  const [messageBox, setMessageBox] = useState(null);

  const username = useAtomValue(usernameAtom);
  const homeMap = useAtomValue(homeMapAtom);

  const { t } = useTranslation();

  const showAlert = (messageBox) => setMessageBox(messageBox);

  useEffect(() => {
    getSubs();
  }, []);

  const subsResult = (result) => {
    if (Array.isArray(result)) {
      setSubsLoaded(true);
      setSubscribedList(result);
    } else {
      showAlert({
        title: t("validate.errorTitle"),
        body: t(`subscribe${result}`),
        closeText: t("users.close"),
      });
    }
  };

  const getSubs = () => {
    jsonRequest(URLS.USER_SUBS)
      .then((result) => {
        subsResult(result);
      })
      .catch((err) => console.error(err));
  };

  const addSubs = (region) => {
    if (region !== "") {
      jsonRequest(URLS.ADD_SUBS, { region })
        .then((result) => {
          subsResult(result);
          showAlert({
            title: t("subscribe.successTitle"),
            body: t("subscribe.successBody"),
            closeText: t("users.close"),
          });
        })
        .catch((err) => console.error(err));
    }
  };

  const delSubs = (region) => {
    const arr = region.split("_").slice(1);
    const body = `${t("subscribe.delConfirm1")} ${arr.reverse().join(", ")}? ${t(
      "subscribe.delConfirm2"
    )}`;

    showAlert({
      title: t("subscribe.delete"),
      body: body,
      closeText: t("users.cancel"),
      confirmText: t("users.confirmText"),
      onConfirm: () => {
        jsonRequest(URLS.DEL_SUBS, { region })
          .then((result) => {
            subsResult(result);
          })
          .catch((err) => console.error(err));
        setMessageBox(null);
      },
    });
  };

  const ListContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
  `;

  const borderRadius = `6px`;

  const Region = styled.div`
    margin: 5px;
    display: flex;
    flex-direction: row;
    // /* border-radius: ${borderRadius}; */
    font: var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) 14px/16px
      var(--unnamed-font-family-roboto);

    letter-spacing: var(--unnamed-character-spacing-0);
    text-align: left;
  `;

  const RegionLabel = styled.span`
    border-radius: 8px 0px 0px 8px;
    border: 1px solid #000000;
    border-right: 0;
    padding: 3px 6px;

    &:hover {
      background: #e1ebf0;
    }
  `;

  const DelButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 17px;
    height: 100%;
    background: var(--orange-4);
    border: 1px solid #000000;
    border-radius: 0px 8px 8px 0px;
    cursor: pointer;
    opacity: 1;

    &:hover {
      background: var(--gray-1);
      color: var(--white);
    }
  `;

  const renderSubscribedTable = (subscribedList) => {
    return (
      <ListContainer>
        {subscribedList.map((region, idx) => {
          const a = region.split("_");
          const municipality = a[2];
          const state = a[1];
          const name = state + ", " + municipality;
          return (
            <Region key={idx} id="regionLabel">
              <RegionLabel title={state}>{municipality}</RegionLabel>
              <DelButton onClick={() => delSubs(region)} title={t("subscribe.delete")}>
                x
              </DelButton>
            </Region>
          );
        })}
      </ListContainer>
    );
  };
  const parsedRegion = selectedRegion && selectedRegion.split("_");

  const renderAddMunicipality = () => {
    if (!selectedRegion) {
      return "";
    } else if (!subscribedList.includes(selectedRegion)) {
      return (
        <div style={{ textAlign: "center", width: "100%" }}>
          <Button extraStyle={{ margin: "1rem 0" }} onClick={() => addSubs(selectedRegion)}>{`${t(
            "subscribe.subscribeTo"
          )} ${parsedRegion[2]}, ${parsedRegion[1]}`}</Button>
        </div>
      );
    } else {
      return <span>{t("subscribe.existing")}</span>;
    }
  };

  return (
    <ToolCard title={t("subscribe.title")} active={active}>
      {username ? (
        <>
          <div>
            {subscribedList.length === 0 ? (
              <p>{subsLoaded ? t("subscribe.noSubs") : t("subscribe.loadingSubs")}</p>
            ) : (
              <div>
                <span>{t("subscribe.subscribedTo")}:</span>
                {renderSubscribedTable(subscribedList)}
              </div>
            )}
          </div>
          <div>
            <HeaderLabel
              extraStyle={{ margin: "16px -16px 10px -16px" }}
              background="#426F96"
              textColor="var(--white)"
            >
              {t("subscribe.addNew")}
            </HeaderLabel>
            <Search
              isPanel={false}
              featureNames={featureNames}
              theMap={homeMap}
            />

            {renderAddMunicipality()}
          </div>
        </>
      ) : (
        <LoginMessage actionText={t("subscribe.loginAction")} />
      )}
      {renderMessageBox(messageBox, () => setMessageBox(null))}
    </ToolCard>
  );
}
