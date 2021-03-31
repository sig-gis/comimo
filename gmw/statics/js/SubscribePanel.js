class SubscribePanel extends React.Component {
    URLS = {
        SUBS: "subscribe/getsubs",
        DELSUBS: "subscribe/delsubs",
        ADDSUBS: "subscribe/addsubs",
    };
    state = {
        subsLoaded: false,
    };

    componentDidMount() {
        this.getSubs();
    }

    getSubs() {
        fetch(this.URLS.SUBS)
            .then(res => res.json())
            .then(result => {
                if (result.action == "Success") {
                    this.setState({
                        subsLoaded: true,
                    });
                    this.props.updateSubList(result.regions.sort());
                }
            })
            .catch(err => console.log(err));
    }

    addSubs(region) {
        if (region != "") {
            fetch(this.URLS.ADDSUBS + "?region=" + region[1] + "&level=" + region[0])
                .then(res => res.json())
                .then(result => {
                    if (result.action == "Created") {
                        var newList = [...this.props.list, result.level + "_" + result.region];
                        newList.sort();
                        this.props.updateSubList(newList);
                    } else if (result.action == "Exists") {
                        alert("You are already subscribed to the region!");
                    }
                })
                .catch(err => console.log(err));
        }
    }

    delSubs(data) {
        var arr = data.split("_");
        var level = arr.splice(0, 1);
        var delConfirm = confirm(
            "Are you sure you want to stop subscribing to " +
                arr.reverse().join(", ") +
                "? You will stop receiving alerts for this region."
        );
        if (delConfirm) {
            fetch(this.URLS.DELSUBS + "?region=" + arr.reverse().join("_") + "&level=" + level)
                .then(res => res.json())
                .then(result => {
                    if (result.action != "Error") {
                        const newList = this.props.list.filter(r => r !== result.level + "_" + result.region)
                        this.props.updateSubList(newList);
                    }
                })
                .catch(err => console.log(err));
        }
    }

    createList(list) {
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
                    {list.map((fullRegion, idx) => {
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
                                        value="X"
                                        type="submit"
                                        className="del-btn"
                                        onClick={() => this.delSubs(fullRegion)}
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
        var list = <div></div>;
        if (this.props.list.length == 0) {
            list = (
                <div className="subs-header">
                    <p>
                        {this.state.subsLoaded
                            ? "You don't seem to be subscribed to alerts from any region!"
                            : "Loading the regions that you are subscribed to"}
                    </p>
                </div>
            );
        } else {
            list = (
                <div>
                    <div className="subs-header">
                        {" "}
                        You are subscribed to alerts from following regions
                    </div>
                    {this.createList(this.props.list)}
                    <br />
                </div>
            );
        }
        var subtocurrent = "";
        var selreg = this.props.selectedRegion;
        if (selreg && this.props.list.indexOf(selreg[0] + "_" + selreg[1]) == -1) {
            var reg = this.props.selectedRegion[1].split("_");
            subtocurrent = (
                <div style={{textAlign: "center", width: "100%"}}>
                    <button
                        type="button"
                        className="btn btn-warning map-upd-btn"
                        onClick={() => this.addSubs(this.props.selectedRegion)}
                    >
                        Subscribe to {reg[1]}, <i>{reg[0]}</i>
                    </button>
                </div>
            );
        }

        return (
            <div
                className={[
                    "popup-container subs-panel ",
                    this.props.isHidden ? "see-through" : "",
                ].join(" ")}
            >
                <h1>
                    <b> YOUR SUBSCRIPTIONS </b>
                </h1>
                {USER_STATE ? (
                    <div>
                        {list}
                        {subtocurrent}
                    </div>
                ) : (
                    <div style={{textAlign: "center", width: "100%"}}>
                        <p> Login to view your subscriptions </p>
                        <button
                            type="button"
                            className="btn btn-warning map-upd-btn"
                            onClick={() => {
                                location.href = "accounts/login";
                            }}
                        >
                            Login
                        </button>
                    </div>
                )}
            </div>
        );
    }
}
