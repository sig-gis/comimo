class StatsPanel extends React.Component {
    constructor(props) {
        super(props);

        this.URL = {
            ARSTATS: "/api/getareapredicted",
            ARTS: "/api/getareats",
        };

        this.state = {
            subsListChanged: false,
            chartsLoaded: false,
            fetchedFor: false
        };
    }

    componentDidMount() {
        google.charts.load("current", {packages: ["corechart"]});
        google.charts.setOnLoadCallback(() => {
            this.setState({
                chartsLoaded: true,
            });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        const initialLoad = this.state.chartsLoaded
            && this.props.selectedDate
            && (this.state.fetchedFor !== this.props.selectedDate);

        const refreshNeeded = this.state.subsListChanged && prevProps.isHidden && !this.props.isHidden;

        console.log(prevProps.subList, this.props.subList)
        if (prevProps.subList !== this.props.subList) {
            this.setState({subsListChanged: true})
        }

        if (USER_STATE && (initialLoad || refreshNeeded)) {
            this.getAreaStats(this.props.selectedDate);
            this.getAreaTS();
            this.setState({fetchedFor: this.props.selectedDate, subsListChanged: false})
        }
    }

    createTooltipHTML(region, area, count) {
        return (
            '<div style="min-width: max-content; display: \
                    flex; flex-direction: column; padding: .4rem; line-height: 1rem"> \
                <label>' +
                region +
                "</label>\n \
                <label>Count: " +
                toPrecision(count, 0) +
                "</label>\n \
                <label>Area: " +
                toPrecision(area, 1) +
                " km^2</label> \
            </div>"
        );
    }

    getAreaStats(date) {
        document.getElementById("stats1").innerHTML = "<b>Loading data...</b>"
        var url = this.URL.ARSTATS + "?date=" + date;
        fetch(url)
            .then(res => res.json())
            .then(result => {
                var data = [];
                for (var i = 0; i < result.names.length; i++) {
                    const area = result.area[i] / 1e6;
                    const count = area / 0.54 ** 2;
                    const name = result.names[i];
                    if (area > 0.0) {
                        data.push([
                            name,
                            count,
                            this.createTooltipHTML(name, area, count),
                        ]);
                    }
                }
                if (data.length > 0) {
                    var dataTable = new google.visualization.DataTable();
                    dataTable.addColumn("string", "Municipality");
                    dataTable.addColumn("number", "Count");
                    dataTable.addColumn({type: "string", role: "tooltip", p: {html: true}});

                    dataTable.addRows(data);

                    var options = {
                        title: "For " + date,
                        width: 290,
                        height: 200,
                        legend: "none",
                        tooltip: {isHtml: true},
                    };

                    // Display the chart inside the <div> element with id="stats1"
                    new google.visualization.ColumnChart(document.getElementById("stats1")).draw(
                        dataTable,
                        options
                    );
                } else {
                    document.getElementById("stats1").innerHTML =
                        "<i>No data found. Subscribe to more regions.</i>";
                }
            })
            .catch(e => console.log("Error loading stats!", e));
    }

    getAreaTS() {
        document.getElementById("stats2").innerHTML = "<b>Loading data...</b>"
        var url = this.URL.ARTS;
        fetch(url)
            .then(res => res.json())
            .then(result => {
                var data = [];
                var nonzero = false;
                for (var i = 0; i < result.names.length; i++) {
                    const area = result.area[i] / 1e6;
                    const count = area / 0.54 ** 2
                    const name = result.names[i];
                    data.push([
                        name.substring(5),
                        count,
                        this.createTooltipHTML(name, area, count),
                    ]);
                    if (area > 0.0) nonzero = true;
                }
                if (nonzero) {
                    var dataTable = new google.visualization.DataTable();
                    dataTable.addColumn("string", "Date");
                    dataTable.addColumn("number", "Count");
                    dataTable.addColumn({type: "string", role: "tooltip", p: {html: true}});

                    dataTable.addRows(data);

                    var options = {
                        title:
                            "From " +
                            result.names[0] +
                            " to " +
                            result.names[result.names.length - 1],
                        width: 290,
                        height: 200,
                        legend: "none",
                        tooltip: {isHtml: true},
                        hAxis: {slantedText: true},
                    };

                    // Display the chart inside the <div> element with id="stats2"
                    new google.visualization.ColumnChart(document.getElementById("stats2")).draw(
                        dataTable,
                        options
                    );
                } else {
                    document.getElementById("stats2").innerHTML =
                        "<i>No data found. Subscribe to more regions.</i>";
                }
            })
            .catch(e => console.log("Error loading stats!", e));
    }

    render() {
        return (
            <div
                className={[
                    "popup-container stat-panel ",
                    this.props.isHidden ? "see-through" : "",
                ].join(" ")}
            >
                {USER_STATE ? (
                    <div>
                        <b>Prediction count per subscribed region</b>
                        <p style={{lineHeight: "1rem", fontSize: ".75rem"}}>
                            *Note: Regions with no predictions are not shown.
                        </p>
                        <div id="stats1">
                            <b>Loading data...</b>
                        </div>
                        <b style={{marginTop: "3px"}}>
                            Total predictions for subscribed regions per reporting period
                        </b>
                        <div id="stats2">
                            <b>Loading data...</b>
                        </div>
                        <p style={{lineHeight: "1rem", fontSize: ".75rem"}}>
                            *Note: each prediction equals an area of 540x540m. Mining activity is
                            not always present in the entire prediction area
                        </p>
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
