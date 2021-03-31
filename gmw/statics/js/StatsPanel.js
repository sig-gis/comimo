class StatsPanel extends React.Component {
    state = {
        names: [],
        series: [],
        c2_dates: [],
        c2_series: [],
        libloaded: false,
    };
    URL = {
        ARSTATS: "/api/getareapredicted",
        ARTS: "/api/getareats",
    };
    fetchedFor = false;

    toPrecision(val, n) {
        const factor = Math.pow(10, n);
        return Math.round(val * factor) / factor;
    }

    createTooltipHTML(region, area, count) {
        return (
            '<div style="min-width: max-content; display: \
                    flex; flex-direction: column; padding: .4rem; line-height: 1rem"> \
            <label>' +
            region +
            "</label>\n \
            <label>Area: " +
            this.toPrecision(area, 1) +
            " km^2</label>\n \
            <label>Count: " +
            this.toPrecision(count, 0) +
            "</label> \
        </div>"
        );
    }

    getAreaStats(date) {
        var url = this.URL.ARSTATS + "?date=" + date;
        fetch(url)
            .then(res => res.json())
            .then(result => {
                var data = [];
                for (var i = 0; i < result.names.length; i++) {
                    const area = result.area[i] / 1e6;
                    const name = result.names[i];
                    if (area > 0.0) {
                        data.push([
                            name,
                            area,
                            this.createTooltipHTML(name, area, area / 0.54 ** 2),
                        ]);
                    }
                }
                if (data.length > 0) {
                    var dataTable = new google.visualization.DataTable();
                    dataTable.addColumn("string", "Municipality");
                    dataTable.addColumn("number", "Area");
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
        var url = this.URL.ARTS;
        fetch(url)
            .then(res => res.json())
            .then(result => {
                var data = [];
                var nonzero = false;
                for (var i = 0; i < result.names.length; i++) {
                    const area = result.area[i] / 1e6;
                    const name = result.names[i];
                    data.push([
                        name.substring(5),
                        area,
                        this.createTooltipHTML(name, area, area / 0.54 ** 2),
                    ]);
                    if (area > 0.0) nonzero = true;
                }
                if (nonzero) {
                    var dataTable = new google.visualization.DataTable();
                    dataTable.addColumn("string", "Date");
                    dataTable.addColumn("number", "Area");
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

    componentDidUpdate() {
        if (USER_STATE && this.state.libloaded && this.fetchedFor != this.props.selectedDate) {
            this.getAreaStats(this.props.selectedDate);
            this.getAreaTS();
            this.fetchedFor = this.props.selectedDate;
        }
    }

    componentDidMount() {
        google.charts.load("current", {packages: ["corechart"]});
        google.charts.setOnLoadCallback(() => {
            this.setState({
                libloaded: true,
            });
        });
    }

    render() {
        return (
            <div
                className={[
                    "popup-container stat-panel ",
                    this.props.ishidden ? "see-through" : "",
                ].join(" ")}
            >
                {USER_STATE ? (
                    <div>
                        <b>Area per subscribed regions (# of mines)</b>
                        <p style={{lineHeight: "1rem", fontSize: ".75rem"}}>
                            *Note: Regions with no mines are not shown.
                        </p>
                        <div id="stats1">
                            <b>Loading data...</b>
                        </div>
                        <b>Total area under subscribed regions (# of mines)</b>
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
