import React, { useRef, useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import LoginMessage from "./LoginMessage";

import Button from "../components/Button";
import ToolCard from "../components/ToolCard";
import ProjectCard from "../components/ProjectCard";
import Select from "../components/Select";
import TextInput from "../components/TextInput";
import HeaderLabel from "../components/HeaderLabel";
import { renderMessageBox } from "../components/Modal";
import LoadingModal from "../components/LoadingModal";
import { usernameAtom } from "../components/PageLayout";

import { jsonRequest } from "../utils";
import { URLS } from "../constants";
import { showModalAtom, processModal } from "../home";
import { useTranslation } from "react-i18next";

const Label = styled.label`
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium)
    var(--unnamed-font-size-16) / var(--unnamed-line-spacing-19) var(--unnamed-font-family-roboto);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--black);
  text-align: left;
`;

export default function ValidatePanel({ subscribedList, featureNames, selectedDates, active }) {
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const username = useAtomValue(usernameAtom);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [regionType, setRegionType] = useState(1);
  const [customRegions, setCustomRegions] = useState([]);
  const [mineType, setMineType] = useState("pMines");
  const [errorMsg, setErrorMsg] = useState(null);
  const [messageBox, setMessageBox] = useState(null);
  const msgRef = useRef(null);

  const scrollToRef = (ref) => ref && ref.current.scrollIntoView({ behavior: "smooth" });

  const { t } = useTranslation();

  const showAlert = (messageBox) => setMessageBox(messageBox);

  useEffect(() => {
    if (username) {
      getProjects();
    }
  }, [username]);

  useEffect(() => {
    errorMsg && scrollToRef(msgRef);
  }, [errorMsg]);

  const getProjects = async () => {
    const res = await jsonRequest(URLS.USER_PROJ).catch(console.error);
    setProjects(res || []);
  };

  const checkProjectErrors = (dataLayer, selected, projectName, projects, type) => {
    const errors = [
      !dataLayer && t("validate.errorDate"),
      selected.length === 0 &&
        (type === 1 ? t("validate.errorNoSubscribe") : t("validate.errorNoRegion")),
      !projectName && t("validate.errorNoName"),
      projects.find((pr) => pr.name === projectName) && t("validate.errorDubName"),
    ].filter((e) => e);
    return errors.length === 0 || setErrorMsg(errors.join("\n\n"));
  };

  const createProject = (dataLayer) => {
    setErrorMsg(null);
    const selectedArr = regionType === 1 ? subscribedList : customRegions.map((x) => "mun_" + x);
    const regions = selectedArr
      .map((r) => {
        const es = r.split("_");
        return es[2] + ", " + es[1];
      })
      .join("; ");
    const question = t("validate.confirmQuestion")
      .replace("{%date}", dataLayer)
      .replace("{%name}", projectName)
      .replace("{%region}", regions);

    if (checkProjectErrors(dataLayer, selectedArr, projectName, projects, regionType)) {
      showAlert({
        title: t("validate.createTitle"),
        body: question,
        closeText: t("users.cancel"),
        confirmText: t("users.confirmText"),
        onConfirm: () => {
          processModal(async () => {
            const res = await jsonRequest(URLS.CREATE_PROJ, {
              dataLayer,
              name: projectName,
              regions: selectedArr,
            }).catch((error) => {
              console.error(error);
              showAlert({
                body: t("validate.errorUnknown"),
                closeText: t("users.close"),
                title: t("validate.errorTitle"),
              });
            });
            if (res === "") {
              getProjects();
            } else {
              const [alertError, logError] = res.split(", ");
              logError && console.log(logError);
              showAlert({
                body: t(`validate.${alertError}`),
                title: t("validate.errorTitle"),
              });
            }
          }, setShowModal);
          setMessageBox(null);
        },
      });
    }
  };

  const closeProject = (projectId) => {
    showAlert({
      title: t("validate.closeTitle"),
      body: t("validate.closeConfirm"),
      closeText: t("users.cancel"),
      confirmText: t("users.confirmText"),
      onConfirm: () => {
        jsonRequest(URLS.CLOSE_PROJ, { projectId })
          .then((res) => {
            if (res === "") {
              setMessageBox(null);
              getProjects();
            } else {
              console.error(t("validate.errorClose"));
              showAlert({
                body: t("validate.errorClose"),
                closeText: t("users.close"),
                title: t("validate.errorTitle"),
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      },
    });
  };

  const customSelect = (val) => {
    const newRegions = customRegions.includes(val)
      ? customRegions.filter((r) => r !== val)
      : [...customRegions, val];
    setCustomRegions(newRegions);
  };

  const renderCustomRegions = () => {
    const states = Object.keys(featureNames).sort();
    return states.length === 0 ? (
      <option key="0" disabled>{`${t("validate.loading")}...`}</option>
    ) : (
      <select
        id="selectProjRegions"
        multiple
        onChange={() => null} // This is to squash the react warning
        size="8"
        style={{ width: "100%", float: "left", marginBottom: "10px" }}
        value={customRegions}
      >
        {states.map((state) => (
          <optgroup key={state} label={state}>
            {Object.keys(featureNames[state])
              .sort()
              .map((mun) => {
                const combined = state + "_" + mun;
                return (
                  <option key={mun} onClick={() => customSelect(combined)} value={combined}>
                    {mun}
                  </option>
                );
              })}
          </optgroup>
        ))}
      </select>
    );
  };

  return (
    <ToolCard title={t("validate.title")} active={active}>
      <HeaderLabel
        extraStyle={{ margin: "-16px -16px 16px -16px" }}
        background="var(--orange-4)"
        textColor="var(--gray-1)"
      >
        {t("validate.subtitle")}
      </HeaderLabel>
      {showModal && <LoadingModal message="Creating Project" />}
      {username ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {projects.length === 0 ? (
            <span>{t("validate.noProjects")}</span>
          ) : (
            <>
              {" "}
              {projects.map((project) => (
                <ProjectCard key={project.id} closeProject={closeProject} project={project} />
              ))}
            </>
          )}
          <HeaderLabel
            extraStyle={{ margin: "16px -16px 16px -16px" }}
            background="#426F96"
            textColor="var(--white)"
          >
            {t("validate.createProject")}
          </HeaderLabel>
          <TextInput
            id="projectName"
            label={`${t("validate.projectName")}:`}
            onChange={(e) => setProjectName(e.target.value)}
            value={projectName}
          />
          <Select
            id="selectMineType"
            label={`${t("validate.typeLabel")}:`}
            onChange={(e) => setMineType(e.target.value)}
            options={["pMines", "nMines", "cMines"].map((m) => ({
              value: m,
              label: t(`validate.${m}`),
            }))}
            value={mineType}
          />
          <Label>{`${t("validate.projectRegion")}:`}</Label>
          <label htmlFor="subscribed" style={{ marginTop: ".25rem", cursor: "pointer" }}>
            <input
              id="subscribed"
              checked={regionType === 1}
              name="projectRegion"
              onChange={() => setRegionType(1)}
              type="radio"
            />
            {t("validate.subscribedRadio")}
          </label>
          <label htmlFor="custom" style={{ marginTop: ".25rem", cursor: "pointer" }}>
            <input
              id="custom"
              checked={regionType === 2}
              name="projectRegion"
              onChange={() => setRegionType(2)}
              type="radio"
              value={2}
            />
            {t("validate.customRadio")}
          </label>
          {regionType === 2 && renderCustomRegions()}
          <Button
            extraStyle={{ marginTop: "1rem" }}
            onClick={() => createProject(selectedDates?.[mineType] || "2022-01-01-N")}
          >{`${t("validate.createButton")} ${selectedDates?.[mineType]}`}</Button>
          <div ref={msgRef}>
            {errorMsg && (
              <p
                css={css`
                  color: var(--red-2);
                `}
              >
                {errorMsg}
              </p>
            )}
          </div>
        </div>
      ) : (
        <LoginMessage actionText={t("validate.loginAction")} />
      )}
      {renderMessageBox(messageBox, () => setMessageBox(null))}
    </ToolCard>
  );
}
