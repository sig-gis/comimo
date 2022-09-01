import React, { useContext, useEffect, useState } from "react";
import styled from "@emotion/styled";

import LoginMessage from "./LoginMessage";
import Button from "../components/Button";
import Search from "../components/Search";
import ToolCard from "../components/ToolCard";

import { URLS } from "../constants";
import { jsonRequest } from "../utils";
import { MainContext } from "../components/PageLayout";
import { useAtom } from "jotai";
import { homeMapAtom, selectedRegionAtom } from "./HomeMap";

const Title = styled.h2`
  border-bottom: 1px solid gray;
  font-weight: bold;
  padding: 0.5rem;
`;

const DeleteButton = styled.input`
  border-radius: 50%;
  height: 1.75rem;
  width: 1.75rem;
  font-size: 1.25rem;
  font-weight: bolder;
  border: none;
  color: red;

  &:hover {
    background: #ff40409e;
  }

  &:active {
    background: #ff0000;
    color: white;
  }

  &:focus {
    outline: none;
  }

  &:disabled {
    background: #ddd;
    color: #aaa;
  }
`;

export default function SubscribePanel({
  featureNames,
  mapquestKey,
  subscribedList,
  setSubscribedList,
  active,
}) {
  const [subsLoaded, setSubsLoaded] = useState(false);
  const [homeMap, _setHomeMap] = useAtom(homeMapAtom);
  const [selectedRegion, setSelectedRegion] = useAtom(selectedRegionAtom);

  const {
    username,
    localeText: { subscribe },
  } = useContext(MainContext);

  useEffect(() => {
    getSubs();
  }, []);

  const subsResult = (result) => {
    if (Array.isArray(result)) {
      setSubsLoaded(true);
      setSubscribedList(result.sort());
    } else {
      alert(subscribe[result]);
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
      `${subscribe.delConfirm1} ${arr.reverse().join(", ")}? ${subscribe?.delConfirm2}`
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
            <th style={{ width: "calc(100% - 50px)" }}>{subscribe?.munLabel}</th>
            <th style={{ width: "30px" }}>{subscribe?.shortDelete}</th>
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
                <td style={{ width: "30px" }}>
                  <DeleteButton onClick={() => delSubs(region)} type="submit" value="X" />
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
    <ToolCard title={subscribe?.title} active={active}>
      {username ? (
        <>
          <div>
            {subscribedList.length === 0 ? (
              <p>{subsLoaded ? subscribe?.noSubs : subscribe?.loadingSubs}</p>
            ) : (
              <div>
                <span>{subscribe?.subscribedTo}:</span>
                {renderSubscribedTable(subscribedList)}
              </div>
            )}
          </div>
          <div>
            <Title>{subscribe?.addNew}</Title>
            <Search isPanel={false} featureNames={featureNames} mapquestKey={mapquestKey}></Search>
            {
              // TODO: inform user (either in UI or alert that is region already been subscribed to and can't add it twice)
              selectedRegion && !subscribedList.includes(selectedRegion) && (
                <div style={{ textAlign: "center", width: "100%" }}>
                  <Button
                    onClick={() => addSubs(selectedRegion)}
                  >{`${subscribe?.subscribeTo} ${parsedRegion[2]}, ${parsedRegion[1]}`}</Button>
                </div>
              )
            }
          </div>
        </>
      ) : (
        <LoginMessage actionText={subscribe?.loginAction} />
      )}
    </ToolCard>
  );
}
