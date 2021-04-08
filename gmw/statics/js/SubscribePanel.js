class SubscribePanel extends React.Component {
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
        fetch(this.URLS.SUBS)
            .then(res => res.json())
            .then(result => {
                if (result.action === "Success") {
                    this.setState({
                        subsLoaded: true
                    });
                    this.props.updateSubList(result.regions.sort());
                }
            })
            .catch(err => console.log(err));
    }

    addSubs(region) {
        if (region !== "") {
            fetch(this.URLS.ADDSUBS + "?region=" + region[1] + "&level=" + region[0])
                .then(res => res.json())
                .then(result => {
                    if (result.action === "Created") {
                        const newList = [...this.props.subList, result.level + "_" + result.region];
                        newList.sort();
                        this.props.updateSubList(newList);
                    } else if (result.action === "Exists") {
                        alert("You are already subscribed to the region!");
                    }
                })
                .catch(err => console.log(err));
        }
    }

    delSubs(data) {
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
                        const newList = this.props.subList.filter(r => r !== result.level + "_" + result.region);
                        this.props.updateSubList(newList);
                    }
                })
                .catch(err => console.log(err));
        }
    }

    createList(subList) {
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
                    {subList.map((fullRegion, idx) => {
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
        const {selectedRegion, subList} = this.props;
        let content;
        if (subList.length === 0) {
            content = (
                <div className="subs-header">
                    <p>
                        {this.state.subsLoaded
                            ? "You don't seem to be subscribed to alerts from any region!"
                            : "Loading the regions that you are subscribed to"}
                    </p>
                </div>
            );
        } else {
            content = (
                <div>
                    <div className="subs-header">
                        {" "}
                        You are subscribed to alerts from following regions
                    </div>
                    {this.createList(subList)}
                    <br/>
                </div>
            );
        }
        let subToCurrent = "";

        if (selectedRegion && subList.indexOf(selectedRegion[0] + "_" + selectedRegion[1]) === -1) {
            const reg = selectedRegion[1].split("_");
            subToCurrent = (
                <div style={{textAlign: "center", width: "100%"}}>
                    <button
                        className="map-upd-btn"
                        onClick={() => this.addSubs(selectedRegion)}
                        type="button"
                    >
                        Subscribe to {reg[1]}, <i>{reg[0]}</i>
                    </button>
                </div>
            );
        }

        return (
            <div className={"popup-container subs-panel " + (this.props.isHidden ? "see-through" : "")}>
                <h3>YOUR SUBSCRIPTIONS</h3>
                {USER_STATE ? (
                    <div>
                        {content}
                        {subToCurrent}
                    </div>
                ) : (
                    <div style={{textAlign: "center", width: "100%"}}>
                        <p> Login to view your subscriptions </p>
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
