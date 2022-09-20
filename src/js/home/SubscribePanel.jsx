import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import LoginMessage from "./LoginMessage";
import Button from "../components/Button";
import Search from "../components/Search";
import ToolCard from "../components/ToolCard";
import DeleteButton from "../components/DeleteButton";
import HeaderLabel from "../components/HeaderLabel";

import { usernameAtom } from "../components/PageLayout";
import { URLS } from "../constants";
import { jsonRequest } from "../utils";
import { useAtomValue } from "jotai";
import { homeMapAtom, selectedRegionAtom } from "./HomeMap";
import { useTranslation } from "react-i18next";

export default function SubscribePanel({
  featureNames,
  mapquestKey,
  subscribedList,
  setSubscribedList,
  active,
}) {
  const [subsLoaded, setSubsLoaded] = useState(false);
  const selectedRegion = useAtomValue(selectedRegionAtom);
  const username = useAtomValue(usernameAtom);
  const homeMap = useAtomValue(homeMapAtom);

  const { t } = useTranslation();

  useEffect(() => {
    getSubs();
  }, []);

  const subsResult = (result) => {
    if (Array.isArray(result)) {
      setSubsLoaded(true);
      setSubscribedList(result.sort());
    } else {
      alert(t(`subscribe${result}`));
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
        })
        .catch((err) => console.error(err));
    }
  };

  const delSubs = (region) => {
    const arr = region.split("_");
    const delConfirm = confirm(
      `${t("subscribe.delConfirm1")} ${arr.reverse().join(", ")}? ${t("subscribe.delConfirm2")}`
    );
    if (delConfirm) {
      jsonRequest(URLS.DEL_SUBS, { region })
        .then((result) => {
          subsResult(result);
        })
        .catch((err) => console.error(err));
    }
  };

  const renderSubscribedTable = (subscribedList) => {
    return (
      <table style={{ width: "100%", textAlign: "left", fontSize: "1rem" }}>
        <thead>
          <tr>
            <th style={{ width: "20px" }}>#</th>
            <th style={{ width: "calc(100% - 50px)" }}>{t("subscribe.munLabel")}</th>
            <th style={{ width: "30px" }}>{t("subscribe.shortDelete")}</th>
          </tr>
        </thead>
        <tbody>
          {subscribedList.map((region, idx) => {
            const arr = region.split("_");
            return (
              <tr key={region}>
                <td style={{ width: "20px" }}>{idx + 1}</td>
                <td style={{ width: "calc(100% - 50px)" }}>
                  {arr[2] + ", "}
                  <i>{arr[1]}</i>
                </td>
                <td style={{ width: "30px", display: "flex", justifyContent: "center" }}>
                  <DeleteButton onClick={() => delSubs(region)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const parsedRegion = selectedRegion && selectedRegion.split("_");

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
              mapquestKey={mapquestKey}
            ></Search>
            {
              // TODO: inform user (either in UI or alert that is region already been subscribed to and can't add it twice)
              selectedRegion && !subscribedList.includes(selectedRegion) && (
                <div style={{ textAlign: "center", width: "100%" }}>
                  <Button
                    extraStyle={{ margin: "1rem 0" }}
                    onClick={() => addSubs(selectedRegion)}
                  >{`${t("subscribe.subscribeTo")} ${parsedRegion[2]}, ${parsedRegion[1]}`}</Button>
                </div>
              )
            }
          </div>
        </>
      ) : (
        <LoginMessage actionText={t("subscribe.loginAction")} />
      )}
    </ToolCard>
  );
}
