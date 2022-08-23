import React from "react";

import LoginMessage from "./LoginMessage";
import Button from "../components/Button";
import ToolPanel from "../components/ToolPanel";
import ProjectCard from "../components/ProjectCard";
import Select from "../components/Select";
import TextInput from "../components/TextInput";

import { jsonRequest } from "../utils";
import { URLS } from "../constants";
import { MainContext } from "../components/PageLayout";
import LoadingModal from "../components/LoadingModal";

export default class ValidatePanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      projects: [],
      projectName: "",
      showModal: false,
      regionType: 1,
      customRegions: [],
      mineType: "pMines",
    };
  }

  componentDidMount() {
    const { username } = this.context;
    if (username) {
      this.getProjects();
    }
  }

  processModal = (callBack) =>
    new Promise(() =>
      Promise.resolve(
        this.setState({ showModal: true }, () =>
          callBack().finally(() => this.setState({ showModal: false }))
        )
      )
    );

  getProjects = () => {
    jsonRequest(URLS.USER_PROJ)
      .then((res) => {
        this.setState({ projects: res || [] });
      })
      .catch((err) => console.error(err));
  };

  checkProjectErrors = (dataLayer, selected, projectName, projects, type, validate) => {
    const errors = [
      !dataLayer && validate.errorDate,
      selected.length === 0 && (type === 1 ? validate.errorNoSubscribe : validate.errorNoRegion),
      !projectName && validate.errorNoName,
      projects.find((pr) => pr[4] === projectName) && validate.errorDubName,
    ].filter((e) => e);
    return errors.length === 0 || this.setState({ errorMsg: errors.join("\n\n") });
  };

  createProject = (dataLayer) => {
    const { customRegions, projectName, projects, regionType } = this.state;
    const { subscribedList } = this.props;
    const {
      localeText: { validate },
    } = this.context;

    this.setState({ errorMsg: false });
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
      this.checkProjectErrors(
        dataLayer,
        selectedArr,
        projectName,
        projects,
        regionType,
        validate
      ) &&
      confirm(question)
    ) {
      this.processModal(() =>
        jsonRequest(URLS.CREATE_PROJ, { dataLayer, name: projectName, regions: selectedArr })
          .then((res) => {
            if (res === "") {
              this.getProjects();
            } else {
              const [alertError, logError] = res.split(", ");
              logError && console.log(logError);
              alert(validate[alertError]);
            }
          })
          .catch((err) => {
            console.error(err);
            alert(validate[validate.errorUnknown]);
          })
      );
    }
  };

  closeProject = (projectId) => {
    const {
      localeText: { validate },
    } = this.context;
    if (confirm(validate.closeConfirm)) {
      jsonRequest(URLS.CLOSE_PROJ, { projectId })
        .then((res) => {
          if (res === "") {
            this.getProjects();
          } else {
            alert(validate.errorClose);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  customSelect = (val) => {
    const { customRegions } = this.state;
    const newRegions = customRegions.includes(val)
      ? customRegions.filter((r) => r !== val)
      : [...customRegions, val];
    this.setState({
      customRegions: newRegions,
    });
  };

  renderCustomRegions = () => {
    const { customRegions } = this.state;
    const { featureNames } = this.props;
    const {
      localeText: { validate },
    } = this.context;
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
                  <option key={mun} onClick={() => this.customSelect(combined)} value={combined}>
                    {mun}
                  </option>
                );
              })}
          </optgroup>
        ))}
      </select>
    );
  };

  render() {
    const { projects, projectName, regionType, errorMsg, mineType } = this.state;
    const { selectedDates } = this.props;
    const {
      username,
      localeText: { validate },
    } = this.context;
    return (
      <ToolPanel title={validate.title}>
        <span>{validate.subtitle}</span>
        {this.state.showModal && <LoadingModal message="Creating Project" />}
        {username ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {projects.length === 0 ? (
              <span>{validate.noProjects}</span>
            ) : (
              <>
                {" "}
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    closeProject={this.closeProject}
                    project={project}
                  />
                ))}
              </>
            )}
            <h3 style={{ marginBottom: 0 }}>{`${validate.createProject}:`}</h3>
            <TextInput
              id="projectName"
              label={`${validate.projectName}:`}
              onChange={(e) => this.setState({ projectName: e.target.value })}
              value={projectName}
            />
            <Select
              id="selectMineType"
              label={`${validate.typeLabel}:`}
              onChange={(e) => this.setState({ mineType: e.target.value })}
              options={["pMines", "nMines", "cMines"].map((m) => ({
                value: m,
                label: validate[m],
              }))}
              value={mineType}
            />
            <label>{`${validate.projectRegion}:`}</label>
            <span style={{ marginTop: ".25rem" }}>
              <input
                checked={regionType === 1}
                name="projectRegion"
                onChange={() => this.setState({ regionType: 1 })}
                type="radio"
              />
              {validate.subscribedRadio}
            </span>
            <span style={{ marginTop: ".25rem" }}>
              <input
                checked={regionType === 2}
                name="projectRegion"
                onChange={() => this.setState({ regionType: 2 })}
                type="radio"
                value={2}
              />
              {validate.customRadio}
            </span>
            {regionType === 2 && this.renderCustomRegions()}
            <Button
              extraStyle={{ marginTop: "1rem" }}
              onClick={() => this.createProject(selectedDates[mineType] || "2022-01-01-N")}
            >{`${validate.createButton} ${selectedDates[mineType]}`}</Button>
            <p>{errorMsg}</p>
          </div>
        ) : (
          <LoginMessage actionText={validate.loginAction} />
        )}
      </ToolPanel>
    );
  }
}
ValidatePanel.contextType = MainContext;
