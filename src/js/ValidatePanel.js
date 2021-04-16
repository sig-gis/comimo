import React from "react";

import SvgIcon from "./SvgIcon";

export default class ValidatePanel extends React.Component {
    constructor(props) {
        super(props);

        this.URLS = {
            PROJS: "subscribe/getprojects",
            CLPROJ: "subscribe/closeproject",
            CRTPROJ: "subscribe/createproject"
        };

        this.state = {
            projects: [],
            deleting: [],
            projectName: "",
            projectCreating: false,
            errorMsg: false,
            regionType: 1,
            customRegions: []
        };
    }

    componentDidMount() {
        if (USER_STATE) {
            fetch(this.URLS.PROJS)
                .then(res => res.json())
                .then(res => {
                    if (res.action === "Success") {
                        this.setState({
                            projects: res.projects
                        });
                    }
                })
                .catch(err => console.log(err));
        }
    }

    checkProjectErrors = (pDate, selected, projectName, projects, type) => {
        const errors = [
            !pDate && "Please select a date.",
            selected.length === 0
                && (type === 1
                    ? "Subscribed regions are loading or you are not subscribed to any region!"
                    : "No region selected!"),
            !projectName && "Please enter a project name!",
            projects.find(pr => pr[4] === projectName) && "A project with that name already exists! Please choose a different name!"
        ].filter(e => e);

        console.log(errors);
        return errors.length === 0 || this.setState({errorMsg: errors.join("\n\n")});
    };

    createProject = pDate => {
        const {customRegions, projectName, projects, regionType} = this.state;
        const {subList} = this.props;
        this.setState({projectCreating: true, errorMsg: false});
        const selectedArr = regionType === 1 ? subList : customRegions.map(x => "mun_" + x);

        const regions = selectedArr
            .map(r => {
                const es = r.split("_");
                return es[2] + ", " + es[1];
            })
            .join(";");
        const question = "Proceed with the configuration => \nprediction date = {%date}\nproject name = {%name} \nregions = {%region}?"
            .replace("{%date}", pDate)
            .replace("{%name}", projectName)
            .replace("{%region}", regions);

        if (this.checkProjectErrors(pDate, selectedArr, projectName, projects, regionType) && confirm(question)) {
            const url = this.URLS.CRTPROJ
                    + "?pdate="
                    + pDate
                    + "&name="
                    + projectName
                    + "&regions="
                    + selectedArr.join("__");
            fetch(url)
                .then(res => res.json())
                .then(res => {
                    if (res.action !== "Error") {
                        this.setState({
                            projectCreating: false,
                            projects: [...projects, res.proj],
                            errorMsg: ""
                        });
                    } else {
                        this.setState({projectCreating: false, errorMsg: res.message});
                    }
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        projectCreating: false,
                        errorMsg: "Unknown Error."
                    });
                });
        } else {
            this.setState({projectCreating: false});
        }
    };

    closeProject = pid => {
        if (confirm("Are you sure you want to close this project? Closing the project means you will no longer be able to validate the points unless you set up another project.")) {
            this.setState({deleting: [...this.state.deleting, pid]});
            fetch(this.URLS.CLPROJ + "?pid=" + pid)
                .then(res => res.json())
                .then(res => {
                    if (res.action === "Archived") {
                        this.setState(prevState => ({
                            deleting: prevState.deleting.filter(p => p !== pid),
                            projects: prevState.projects.filter(pr => pr[2] !== pid)
                        }));
                    } else {
                        return Promise.reject("Could not close project.");
                    }
                })
                .catch(err => {
                    this.setState(prevState => ({deleting: prevState.deleting.filter(p => p !== pid)}));
                    console.log(err);
                });
        }
    };

    renderProject = (predDate, createdDate, pid, url, projectName, regions) => (
        <tr key={pid}>
            <td style={{width: "calc(100% - 30px)"}}>
                <a href={url} rel="noreferrer" target="_blank">
                    {projectName}
                </a>
                <br/>
                <small>Prediction date: {predDate}</small>
                <br/>
                <small>Created date: {createdDate}</small>
                <br/>
                <small>Regions: {regions
                    .split("__")
                    .map(x => x.split("_"))
                    .map(x => x[2] + ", " + x[1])
                    .join(";")}
                </small>
            </td>
            <td style={{verticalAlign: "top"}}>
                <button
                    className="del-btn green-btn p-0"
                    disabled={this.state.deleting.includes(pid)}
                    onClick={() => this.closeProject(pid)}
                    style={{height: "30px", width: "30px"}}
                    title={"Close " + projectName}
                    type="button"
                >
                    <SvgIcon extraStyle={{margin: "3px"}} icon="check" size="24px"/>
                </button>
            </td>
        </tr>
    );

    renderCustomRegions = () => {
        const {featureNames} = this.props;
        const states = Object.keys(featureNames).sort();
        return states.length === 0
            ? (
                <option key="0" disabled>
                    Loading ...
                </option>
            ) : (
                <select
                    id="selectProjRegions"
                    multiple
                    onChange={e => this.setState({
                        customRegions: Array.from(e.target.selectedOptions, option => option.value)
                    })}
                    size="8"
                    style={{width: "100%", float: "left", marginBottom: "10px"}}
                    value={this.state.customRegions}
                >
                    {states.map(state => (
                        <optgroup key={state} label={state}>
                            {Object.keys(featureNames[state]).sort().map(mun => (
                                <option key={mun} value={state + "_" + mun}>{mun}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            );
    };

    render() {
        const {selectedDate, isHidden} = this.props;
        const {projects, projectName, regionType, projectCreating, errorMsg} = this.state;
        return (
            <div className={"popup-container validate-panel " + (isHidden ? "see-through" : "")}>
                <h3>VALIDATION</h3>
                View or add projects to validate mine data.
                {USER_STATE
                    ? (
                        <div style={{display: "flex", flexDirection: "column"}}>
                            {projects.length === 0
                                ? (
                                    <span>You don&apos;t have any active projects.</span>
                                ) : (
                                    <table style={{width: "100%", textAlign: "left"}}>
                                        <thead>
                                            <tr>
                                                <th style={{width: "calc(100% - 50px)"}}>Name</th>
                                                <th/>
                                            </tr>
                                        </thead>
                                        <tbody>{projects.map(p => this.renderProject(...p))}</tbody>
                                    </table>
                                )}
                            <h3 style={{marginBottom: 0}}>Create a new project:</h3>
                            <label>Enter Project Name:</label>
                            <input
                                id="projectName"
                                length="2"
                                onChange={e => this.setState({projectName: e.target.value})}
                                style={{width: "100%"}}
                                value={projectName}
                            />
                            <label>Select Project Region:</label>
                            <span style={{marginTop: ".25rem"}}>
                                <input
                                    checked={regionType === 1}
                                    name="projectRegion"
                                    onChange={() => this.setState({regionType: 1})}
                                    type="radio"
                                />
                                Subscribed Regions
                            </span>
                            <span style={{marginTop: ".25rem"}}>
                                <input
                                    checked={regionType === 2}
                                    name="projectRegion"
                                    onChange={() => this.setState({regionType: 2})}
                                    type="radio"
                                    value={2}
                                />
                                Custom Regions
                            </span>
                            {regionType === 2 && this.renderCustomRegions()}
                            <button
                                className="map-upd-btn"
                                disabled={projectCreating}
                                onClick={() => this.createProject(selectedDate)}
                                style={{marginTop: ".25rem"}}
                                type="button"
                            >
                                Create new project for {selectedDate}
                            </button>
                            <p>{errorMsg}</p>
                        </div>
                    ) : (
                        <div style={{textAlign: "center", width: "100%"}}>
                            <p> Login to validate the data </p>
                            <button
                                className="map-upd-btn"
                                onClick={() => {
                                    location.href = "accounts/login";
                                }}
                                type="button"
                            >
                                Login
                            </button>
                        </div>
                    )}
            </div>
        );
    }
}
