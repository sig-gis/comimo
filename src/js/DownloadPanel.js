import React from "react";

import {MainContext} from "./context";

export default class DownloadPanel extends React.Component {
    constructor(props) {
        super(props);

        this.URL = {
            GETDL: "/api/getdownloadurl"
        };

        this.state = {
            clipOption: 1,
            downloadURL: false,
            fetching: false
        };
    }

    getDownloadUrl = () => {
        const {selectedRegion, selectedDate} = this.context;
        const {clipOption} = this.state;
        this.setState({fetching: true});

        const [level, region] = clipOption === 1 ? ["", "all"] : selectedRegion;
        fetch(this.URL.GETDL + "?region=" + region + "&level=" + level + "&date=" + selectedDate)
            .then(res => res.json())
            .then(res => {
                if (res.action === "success") {
                    this.setState({downloadURL: [region, level, selectedDate, res.url]});
                }
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => this.setState({fetching: false}));
    };

    render() {
        const {isHidden} = this.props;
        const {clipOption, fetching, downloadURL} = this.state;
        const {selectedRegion, selectedDate} = this.context;
        return (
            <div className={"popup-container download-panel " + (isHidden ? "see-through" : "")}>
                <h3>DOWNLOAD DATA</h3>
                <label>Select Region</label>
                <div style={{marginTop: ".25rem"}}>
                    <input
                        checked={clipOption === 1}
                        name="downloadRegion"
                        onChange={() => this.setState({clipOption: 1})}
                        type="radio"
                    />
                    Complete Data
                </div>
                <div className={selectedRegion ? "" : "disabled-group"} style={{marginTop: ".25rem"}}>
                    <input
                        checked={clipOption === 2}
                        name="downloadRegion"
                        onChange={() => this.setState({clipOption: 2})}
                        type="radio"
                    />
                    Selected Municipality
                </div>
                <br/>
                {selectedDate && (
                    <div style={{textAlign: "center", width: "100%"}}>
                        <button
                            className="map-upd-btn"
                            disabled={fetching}
                            onClick={this.getDownloadUrl}
                            type="button"
                        >
                    Get download URL for {selectedDate}
                        </button>
                    </div>
                )}
                {fetching
                    ? <p>Fetching download URL ...</p>
                    : downloadURL && (
                        <p>
                            <span>
                                <a href={downloadURL[3]}>
                                    Click here to download the{" "}
                                    {downloadURL[0] === "all"
                                        ? "complete data"
                                        : "data within " + downloadURL[0]}{" "}
                                    for {downloadURL[2]}.
                                </a>
                            </span>
                        </p>
                    )}
            </div>
        );
    }
}
DownloadPanel.contextType = MainContext;
