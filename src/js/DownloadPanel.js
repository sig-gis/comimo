import React from "react";

export default class DownloadPanel extends React.Component {
    constructor(props) {
        super(props);

        this.URL = {
            GETDL: "/api/getdownloadurl"
        };

        this.state = {
            clipOption: 1,
            downURL: false,
            fetching: false
        };
    }

    getDownloadUrl = () => {
        const [level, region] = this.state.clipOption === 1
            ? ["", "all"]
            : [...this.props.selectedRegion, this.props.selectedDate];
        const date = this.props.selectedDate;

        const url = this.URL.GETDL + "?region=" + region + "&level=" + level + "&date=" + date;
        this.setState({fetching: true});
        fetch(url)
            .then(res => res.json())
            .then(res => {
                if (res.action === "success") {
                    this.setState({
                        downURL: [region, level, date, res.url],
                        fetching: false
                    });
                }
            })
            .catch(err => {
                console.log(err);
            });
    };

    render() {
        return (
            <div className={"popup-container download-panel " + (this.props.isHidden ? "see-through" : "")}>
                <h3>DOWNLOAD DATA</h3>
                <label>Select Region</label>
                <div style={{marginTop: ".25rem"}}>
                    <input
                        checked={this.state.clipOption === 1}
                        name="downloadRegion"
                        onChange={() => this.setState({clipOption: 1})}
                        type="radio"
                    />
                    Complete Data
                </div>
                <div className={this.props.selectedRegion ? "" : "disabled-group"} style={{marginTop: ".25rem"}}>
                    <input
                        checked={this.state.clipOption === 2}
                        name="downloadRegion"
                        onChange={() => this.setState({clipOption: 2})}
                        type="radio"
                    />
                    Selected Municipality
                </div>
                <br/>
                {this.props.selectedDate && (
                    <div style={{textAlign: "center", width: "100%"}}>
                        <button
                            className="map-upd-btn"
                            disabled={this.state.fetching}
                            onClick={this.getDownloadUrl}
                            type="button"
                        >
                    Get download URL for {this.props.selectedDate}
                        </button>
                    </div>
                )}
                {this.state.fetching
                    ? <p>Fetching download URL ...</p>
                    : this.state.downURL && (
                        <p>
                            <span>
                                <a href={this.state.downURL[3]}>
                                    Click here to download the{" "}
                                    {this.state.downURL[0] === "all"
                                        ? "complete data"
                                        : "data within " + this.state.downURL[0]}{" "}
                                    for {this.state.downURL[2]}.
                                </a>
                            </span>
                        </p>
                    )}
            </div>
        );
    }
}
