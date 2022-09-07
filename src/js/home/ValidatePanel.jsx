import React, { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";

import LoginMessage from "./LoginMessage";
import Button from "../components/Button";
import ToolCard from "../components/ToolCard";
import ProjectCard from "../components/ProjectCard";
import Select from "../components/Select";
import TextInput from "../components/TextInput";

import { usernameAtom } from "../components/PageLayout";
import { jsonRequest } from "../utils";
import { URLS } from "../constants";
import LoadingModal from "../components/LoadingModal";
import { showModalAtom, processModal } from "../home";
import { useTranslation } from "react-i18next";

export default function ValidatePanel({ subscribedList, featureNames, selectedDates, active }) {
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const username = useAtomValue(usernameAtom);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [regionType, setRegionType] = useState(1);
  const [customRegions, setCustomRegions] = useState([]);
  const [mineType, setMineType] = useState("pMines");
  const [errorMsg, setErrorMsg] = useState(false);


  const { t } = useTranslation();

  useEffect(() => {
    if (username) {
      getProjects();
    }
  }, []);

  const getProjects = () => {
    jsonRequest(URLS.USER_PROJ)
      .then((res) => {
        setProjects(res || []);
      })
      .catch((err) => console.error(err));
  };

  // const processModal = (callBack) =>
  //   new Promise(() => {
  //     setShowModal(true);
  //     callBack().finally(() => setShowModal(false));
  //   });

  const checkProjectErrors = (dataLayer, selected, projectName, projects, type, validate) => {
    const errors = [
      !dataLayer && validate.errorDate,
      selected.length === 0 && (type === 1 ? validate.errorNoSubscribe : validate.errorNoRegion),
      !projectName && validate.errorNoName,
      projects.find((pr) => pr[4] === projectName) && validate.errorDubName,
    ].filter((e) => e);
    return errors.length === 0 || setErrorMsg(errors.join("\n\n"));
  };

  const createProject = (dataLayer) => {
    setErrorMsg(false);
    const selectedArr = regionType === 1 ? subscribedList : customRegions.map((x) => "mun_" + x);
    const regions = selectedArr
      .map((r) => {
        const es = r.split("_");
        return es[2] + ", " + es[1];
      })
      .join(";");
    const question = validate.confirmQuestion
      .replace("{%date}", dataLayer)
      .replace("{%name}", projectName)
      .replace("{%region}", regions);

    if (
      checkProjectErrors(dataLayer, selectedArr, projectName, projects, regionType, validate) &&
      confirm(question)
    ) {
      processModal(
        () =>
          jsonRequest(URLS.CREATE_PROJ, { dataLayer, name: projectName, regions: selectedArr })
            .then((res) => {
              if (res === "") {
                getProjects();
              } else {
                const [alertError, logError] = res.split(", ");
                logError && console.log(logError);
                alert(t(`validate.${alertError}`));
              }
            })
            .catch((err) => {
              console.error(err);
              alert(t("validate.errorUnknown"));
            }),
        setShowModal
      );
    }
  };

  const closeProject = (projectId) => {
    if (confirm(t("validate.closeConfirm"))) {
      jsonRequest(URLS.CLOSE_PROJ, { projectId })
        .then((res) => {
          if (res === "") {
            getProjects();
          } else {
            alert(t("validate.errorClose"));
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const customSelect = (val) => {
    // const { customRegions } = this.state;
    const newRegions = customRegions.includes(val)
      ? customRegions.filter((r) => r !== val)
      : [...customRegions, val];
    setCustomRegions(newRegions);
  };

  const renderCustomRegions = () => {
    // const { customRegions } = this.state;
    // const { featureNames } = this.props;
    // const {
    //   localeText: { validate },
    // } = this.context;
    const states = Object.keys(featureNames).sort();
    return states.length === 0 ? (
      <option key="0" disabled>{`${validate.loading}...`}</option>
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
      <span>{t("validate.subtitle")}</span>
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
          <h3 style={{ marginBottom: 0 }}>{`${t("validate.createProject")}:`}</h3>
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
          <label>{`${t("validate.projectRegion")}:`}</label>
          <span style={{ marginTop: ".25rem" }}>
            <input
              checked={regionType === 1}
              name="projectRegion"
              onChange={() => setRegionType(1)}
              type="radio"
            />
            {t("validate.subscribedRadio")}
          </span>
          <span style={{ marginTop: ".25rem" }}>
            <input
              checked={regionType === 2}
              name="projectRegion"
              onChange={() => setRegionType(2)}
              type="radio"
              value={2}
            />
            {t("validate.customRadio")}
          </span>
          {regionType === 2 && renderCustomRegions()}
          <Button
            extraStyle={{ marginTop: "1rem" }}
            onClick={() => createProject(selectedDates?.[mineType] || "2022-01-01-N")}
          >{`${t("validate.createButton")} ${selectedDates?.[mineType]}`}</Button>
          <p>{errorMsg}</p>
        </div>
      ) : (
        <LoginMessage actionText={t("validate.loginAction")} />
      )}
    </ToolCard>
  );
}
