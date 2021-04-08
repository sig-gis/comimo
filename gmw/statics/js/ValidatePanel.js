class ValidatePanel extends React.Component {
    constructor(props) {
        super(props);

        this.URLS = {
            PROJS: "subscribe/getprojects",
            CLPROJ: "subscribe/closeproject",
            CRTPROJ: "subscribe/createproject"
        };

        this.state = {
            projects: [],
            delete: [],
            createState: true,
            errorMsg: false,
            region: 1
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

    handleSelectClick = e => {
        e.preventDefault();
        // e.target.selected = !e.target.selected;
        const select = e.target.parentElement.parentElement;
        console.log(select);
        const scroll = select.scrollTop;
        console.log(scroll);
        e.target.selected = !e.target.selected;
        setTimeout(() => {
            select.scrollTop = scroll;
        }, 0);
    };

    createProject(e, pdate) {
        this.setState({createState: false, errorMsg: false});
        let selectedArr = [];
        let regionError = "";
        if (this.state.region === 1) {
            selectedArr = this.props.sublist;
            regionError = "Subscribed regions are loading or you are not subscribed to any region!";
        } else if (this.state.region === 2) {
            selectedArr = [...document.getElementById("selectProjRegions").options]
                .filter(x => x.selected)
                .map(x => "mun_" + x.value);
            regionError = "No region selected!";
        }
        const name = document.getElementById("projectName").value;

        let errorText = "";
        if (!name) errorText += "Please enter a project name!\n";
        else if (this.state.projects.map(x => x[4]).includes(name)) {
            errorText
                += "A project with that name already exists! Please choose a different name!\n";
        } else if (!selectedArr.length) errorText += regionError;

        if (errorText) {
            this.setState({
                createState: true,
                errorMsg: errorText
            });
        } else {
            const disp = selectedArr
                .map(() => {
                    const es = e.split("_");
                    return es[2] + ", " + es[1];
                })
                .join(";");
            const question = "Proceed with the configuration => prediction date = {%date}, project name = {%name} and regions = {%region}?"
                .replace("{%date}", pdate)
                .replace("{%name}", name)
                .replace("{%region}", disp);
            const proceed = confirm(question);
            if (proceed) {
                const url = this.URLS.CRTPROJ
                    + "?pdate="
                    + pdate
                    + "&name="
                    + name
                    + "&regions="
                    + selectedArr.join("__");
                if (USER_STATE) {
                    fetch(url)
                        .then(res => res.json())
                        .then(
                            res => {
                                if (res.action != "Error") {
                                    const {projects} = this.state;
                                    projects.push(res.proj);
                                    this.setState({
                                        createState: true,
                                        projects
                                    });
                                } else {
                                    this.setState({createState: true, errorMsg: res.message});
                                }
                            },
                            err => {
                                l(err);
                                this.setState({
                                    createState: true,
                                    errorMsg: "Something went wrong!"
                                });
                            }
                        );
                }
            } else this.setState({createState: true});
        }
    }

    closeProject(e, pdate, pid, i) {
        // e.target.disabled = true;
        this.setState({
            delete: this.state.delete.concat([pid])
        });
        const template = "Are you sure you want to close the project for %pdate? Closing the project means you will no longer be able to validate the points unless you set up another project.";
        const intent = confirm(template.replace("%pdate", pdate));
        const url = this.URLS.CLPROJ + "?pid=" + pid + "&pdate=" + pdate;
        if (intent) {
            const p = this.state.projects[i];
            fetch(url)
                .then(res => res.json())
                .then(
                    res => {
                        if (res.action === "Archived") {
                            const {projects} = this.state;
                            const j = projects.indexOf(p);
                            projects.splice(j, 1);
                            const itemIndex = this.state.delete.indexOf(pid);
                            const del = this.state.delete;
                            if (itemIndex > -1) {
                                del.splice(itemIndex, 1);
                            }
                            this.setState({
                                projects,
                                delete: del
                            });
                        } else {
                            l("Could not close project.");
                        }
                    },
                    err => {
                        e.target.disabled = false;
                        l(err);
                    }
                );
        } else {
            e.target.disabled = false;
        }
    }

    constructListElem(el, i) {
        // el = el.split("__");
        const r = el[5]
            .split("__")
            .map(x => x.split("_"))
            .map(x => x[2] + ", " + x[1])
            .join(";");
        return (
            <tr key={i}>
                <td style={{width: "20px"}}>{i + 1}</td>
                <td style={{width: "calc(100% - 50px)"}}>
                    <a href={el[3]} rel="noreferrer" target="_blank">
                        {" "}
                        {el[4]}
                    </a>
                    <br/>
                    <small>Prediction date:{el[0]}</small>
                    <br/>
                    <small>Created date:{el[1]}</small>
                    <br/>
                    <small>Regions:{r}</small>
                </td>
                <td style={{textAlign: "right"}}>
                    <input
                        className="del-btn green-btn"
                        disabled={this.state.delete.includes(el[2])}
                        onClick={e => this.closeProject(e, el[0], el[2], i)}
                        title={"Close " + el[4]}
                        type="submit"
                        value="X"
                    />
                </td>
            </tr>
        );
    }

    generateMunicipalOptions() {
        const options = [];
        const f = this.props.featureNames;
        const states = Object.keys(f).sort();
        if (states.length <= 0) {
            options.push(
                <option key="0" disabled>
                    Loading ...
                </option>
            );
        } else {
            for (let s = 0; s < states.length; s++) {
                const state = states[s];
                const muns = Object.keys(f[state]).sort();
                const munopts = [];
                for (let m = 0; m < muns.length; m++) {
                    const mun = muns[m];
                    munopts.push(
                        <option
                            key={"m" + m}
                            onMouseDown={this.handleSelectClick}
                            value={state + "_" + mun}
                        >
                            {mun}
                        </option>
                    );
                }
                options.push(
                    <optgroup key={"s" + s} label={state}>
                        {munopts}
                    </optgroup>
                );
            }
        }
        return (
            <select
                id="selectProjRegions"
                multiple
                size="8"
                style={{width: "100%", float: "left", marginBottom: "10px"}}
            >
                {options}
            </select>
        );
    }

    regionRadioChanged(e) {
        this.setState({
            region: e.target.value
        });
    }

    render() {
        let buttonContent = null;
        let context = null;
        let addOptions = "";

        if (USER_STATE) {
            const selDate = this.props.selectedDate;
            if (selDate) {
                const match = this.state.projects.filter(x => x.includes(selDate + "__"));
                if (match.length === 0) {
                    buttonContent = (
                        <div style={{textAlign: "center", width: "100%"}}>
                            <br/>
                            <button
                                className="map-upd-btn"
                                disabled={!this.state.createState}
                                onClick={e => {
                                    this.createProject(e, selDate);
                                }}
                                type="button"
                            >
                                Create new project for {selDate}
                            </button>
                        </div>
                    );
                }
            }
            if (this.state.projects.length === 0) {
                context = <div>You don&apos;t have any active projects at the moment.</div>;
            } else {
                const projectList = [];
                for (let i = 0; i < this.state.projects.length; i++) {
                    projectList.push(this.constructListElem(this.state.projects[i], i));
                }
                context = (
                    <div>
                        Click on the dates below to validate mined predictions for that day.
                        <ul className="sub-list">{projectList}</ul>
                    </div>
                );
                context = (
                    <table style={{width: "100%", textAlign: "left"}}>
                        <thead>
                            <tr>
                                <th style={{width: "20px"}}>SN</th>
                                <th style={{width: "calc(100% - 50px)"}}>Name</th>
                                <th style={{width: "30px"}}>Close</th>
                            </tr>
                        </thead>
                        <tbody>{projectList}</tbody>
                    </table>
                );
            }

            if (this.state.region === 2) addOptions = this.generateMunicipalOptions();
        }

        return (
            <div className={"popup-container validate-panel " + (this.props.isHidden ? "see-through" : "")}>
                <h3>VALIDATION</h3>
                {!USER_STATE
                    ? (
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
                    ) : (
                        <div>
                            {context}
                            <br/>
                            <h3>Create a new project:</h3>
                            <label>Enter Project Name:</label>
                            <br/>
                            <input id="projectName" length="2" style={{width: "100%"}}/>
                            <br/>
                            <label>Select Project Region:</label>
                            <br/>
                            <input
                                defaultChecked
                                name="projectRegion"
                                onChange={this.regionRadioChanged.bind(this)}
                                type="radio"
                                value={1}
                            />
                            {" "}
                            Subscribed Regions <br/>
                            <input
                                name="projectRegion"
                                onChange={this.regionRadioChanged.bind(this)}
                                type="radio"
                                value={2}
                            />{" "}
                            Custom Regions <br/>
                            {addOptions}
                            {buttonContent}
                            {this.state.errorMsg}
                        </div>
                    )}
            </div>
        );
    }
}
