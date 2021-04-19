import React from "react";

import LoginMessage from "./LoginMessage";

import {MainContext} from "./context";

export default class SubscribePanel extends React.Component {
    constructor(props) {
        super(props);

        this.URLS = {
            SUBS: "subscribe/getsubs",
            DELSUBS: "subscribe/delsubs",
            ADDSUBS: "subscribe/addsubs"
        };

        this.state = {
            subsLoaded: false
        };
    }

    componentDidMount() {
        this.getSubs();
    }

    getSubs() {
        const {updateSubList} = this.props;
        fetch(this.URLS.SUBS)
            .then(res => res.json())
            .then(result => {
                if (result.action === "Success") {
                    this.setState({
                        subsLoaded: true
                    });
                    updateSubList(result.regions.sort());
                }
            })
            .catch(err => console.log(err));
    }

    addSubs(region) {
        const {updateSubList} = this.props;
        const {subscribedList} = this.context;
        if (region !== "") {
            fetch(this.URLS.ADDSUBS + "?region=" + region[1] + "&level=" + region[0])
                .then(res => res.json())
                .then(result => {
                    if (result.action === "Created") {
                        const newList = [...subscribedList, result.level + "_" + result.region];
                        newList.sort();
                        updateSubList(newList);
                    } else if (result.action === "Exists") {
                        alert("You are already subscribed to the region!");
                    }
                })
                .catch(err => console.log(err));
        }
    }

    delSubs(data) {
        const {updateSubList} = this.props;
        const {subscribedList} = this.context;
        const arr = data.split("_");
        const level = arr.splice(0, 1);
        const delConfirm = confirm(
            "Are you sure you want to stop subscribing to "
                + arr.reverse().join(", ")
                + "? You will stop receiving alerts for this region."
        );
        if (delConfirm) {
            fetch(this.URLS.DELSUBS + "?region=" + arr.reverse().join("_") + "&level=" + level)
                .then(res => res.json())
                .then(result => {
                    if (result.action !== "Error") {
                        const newList = subscribedList.filter(r => r !== result.level + "_" + result.region);
                        updateSubList(newList);
                    }
                })
                .catch(err => console.log(err));
        }
    }

    renderSubscribedTable(subscribedList) {
        return (
            <table style={{width: "100%", textAlign: "left"}}>
                <thead>
                    <tr>
                        <th style={{width: "20px"}}>SN</th>
                        <th style={{width: "calc(100% - 50px)"}}>Municipality</th>
                        <th style={{width: "30px"}}>Del</th>
                    </tr>
                </thead>
                <tbody>
                    {subscribedList.map((fullRegion, idx) => {
                        const arr = fullRegion.split("_");
                        return (
                            <tr key={fullRegion}>
                                <td style={{width: "20px"}}>{idx + 1}</td>
                                <td style={{width: "calc(100% - 50px)"}}>
                                    {arr[2] + ", "}
                                    <i>{arr[1]}</i>
                                </td>
                                <td style={{width: "30px"}}>
                                    <input
                                        className="del-btn"
                                        onClick={() => this.delSubs(fullRegion)}
                                        type="submit"
                                        value="X"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    }

    render() {
        const {subsLoaded} = this.state;
        const {isHidden} = this.props;
        const {selectedRegion, subscribedList, isUser} = this.context;
        const parsedRegion = selectedRegion && selectedRegion[1].split("_");
        return (
            <div className={"popup-container subs-panel " + (isHidden ? "see-through" : "")}>
                <h3>YOUR SUBSCRIPTIONS</h3>
                {isUser ? (
                    <div>
                        {subscribedList.length === 0
                            ? (
                                <div className="subs-header">
                                    <p>
                                        {subsLoaded
                                            ? "You are not subscribed to any alerts."
                                            : "Loading subscriptions..."}
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="subs-header">
                                        You are subscribed to alerts from following regions
                                    </div>
                                    {this.renderSubscribedTable(subscribedList)}
                                    <br/>
                                </div>
                            )}
                        {parsedRegion && subscribedList.indexOf(selectedRegion[0] + "_" + selectedRegion[1]) === -1 && (
                            <div style={{textAlign: "center", width: "100%"}}>
                                <button
                                    className="map-upd-btn"
                                    onClick={() => this.addSubs(selectedRegion)}
                                    type="button"
                                >
                                    Subscribe to {parsedRegion[1]}, <i>{parsedRegion[0]}</i>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <LoginMessage actionText="subscriptions"/>
                )}
            </div>
        );
    }
}
SubscribePanel.contextType = MainContext;
