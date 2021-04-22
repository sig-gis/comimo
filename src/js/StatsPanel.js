import React from "react";

import {MainContext} from "./context";
import {toPrecision} from "./utils";

export default class StatsPanel extends React.Component {
    constructor(props) {
        super(props);

        this.URL = {
            ARSTATS: "/api/getareapredicted",
            ARTS: "/api/getareats"
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
                chartsLoaded: true
            });
        });
    }

    componentDidUpdate(prevProps, prevState) {
        const initialLoad = this.state.chartsLoaded
            && this.props.selectedDate
            && (this.state.fetchedFor !== this.props.selectedDate);

        const refreshNeeded = this.state.subsListChanged
            && prevProps.isHidden
            && !this.props.isHidden;

        if (prevProps.subscribedList !== this.props.subscribedList) {
            this.setState({subsListChanged: true});
        }

        if (initialLoad || refreshNeeded) {
            this.getAreaStats(this.props.selectedDate);
            this.getAreaTS();
            this.setState({fetchedFor: this.props.selectedDate, subsListChanged: false});
        }
    }

    getAreaStats(date) {
        const {localeText: {stats}} = this.context;
        document.getElementById("stats1").innerHTML = `${stats.loading}...`;
        fetch(this.URL.ARSTATS + "?date=" + date)
            .then(res => res.json())
            .then(result => {
                const data = [];
                for (let i = 0; i < result.names.length; i++) {
                    const count = result.area[i] / 1e6 / 0.54 ** 2;
                    const name = result.names[i];
                    if (count > 0.0) {
                        data.push([
                            name,
                            count,
                            this.createTooltipHTML(name, count, stats.countLabel)
                        ]);
                    }
                }
                if (data.length > 0) {
                    const dataTable = new google.visualization.DataTable();
                    dataTable.addColumn("string", stats.munLabel);
                    dataTable.addColumn("number", stats.countLabel);
                    dataTable.addColumn({type: "string", role: "tooltip", p: {html: true}});

                    dataTable.addRows(data);

                    const options = {
                        title: "For " + date,
                        width: 290,
                        height: 200,
                        legend: "none",
                        tooltip: {isHtml: true}
                    };

                    // Display the chart inside the <div> element with id="stats1"
                    new google.visualization.ColumnChart(document.getElementById("stats1")).draw(
                        dataTable,
                        options
                    );
                } else {
                    document.getElementById("stats1").innerHTML = `<i>${stats.noDataFound}</i>`;
                }
            })
            .catch(e => console.log(stats.errorStats, e));
    }

    getAreaTS() {
        const {localeText: {stats}} = this.context;
        document.getElementById("stats2").innerHTML = `${stats.loading}...`;
        fetch(this.URL.ARTS)
            .then(res => res.json())
            .then(result => {
                const data = [];
                let nonzero = false;
                for (let i = 0; i < result.names.length; i++) {
                    const count = result.area[i] / 1e6 / 0.54 ** 2;
                    const name = result.names[i];
                    data.push([
                        name.substring(5),
                        count,
                        this.createTooltipHTML(name, count, stats.countLabel)
                    ]);
                    if (count > 0.0) nonzero = true;
                }
                if (nonzero) {
                    const dataTable = new google.visualization.DataTable();
                    dataTable.addColumn("string", stats.dateLabel);
                    dataTable.addColumn("number", stats.countLabel);
                    dataTable.addColumn({type: "string", role: "tooltip", p: {html: true}});

                    dataTable.addRows(data);

                    const options = {
                        title:
                            "From "
                            + result.names[0]
                            + " to "
                            + result.names[result.names.length - 1],
                        width: 290,
                        height: 200,
                        legend: "none",
                        tooltip: {isHtml: true},
                        hAxis: {slantedText: true}
                    };

                    // Display the chart inside the <div> element with id="stats2"
                    new google.visualization.ColumnChart(document.getElementById("stats2")).draw(
                        dataTable,
                        options
                    );
                } else {
                    document.getElementById("stats2").innerHTML = `<i>${stats.noDataFound}</i>`;
                }
            })
            .catch(e => console.log(stats.errorStats, e));
    }

    createTooltipHTML = (region, count, countLabel) => (
        `<div style="min-width: max-content; display: flex; flex-direction: column; padding: .4rem; line-height: 1rem">
            <span>${region}</span>
            <span><strong>${countLabel}: </strong>${toPrecision(count, 0)}</span>
        </div>`
    );

    render() {
        const {isHidden} = this.props;
        const {localeText: {stats}} = this.context;
        return (
            <div
                className={"popup-container stat-panel " + (isHidden ? "see-through" : "")}
            >
                <div>
                    <h3>{stats.regionTitle}</h3>
                    <p style={{lineHeight: "1rem", fontSize: ".75rem"}}>
                        {stats.regionSubTitle}
                    </p>
                    <div id="stats1">
                        {`${stats.loading}...`}
                    </div>
                    <h3>{stats.dateTitle}</h3>
                    <div id="stats2">
                        {`${stats.loading}...`}
                    </div>
                    <p style={{lineHeight: "1rem", fontSize: ".75rem"}}>
                        {stats.areaWarning}
                    </p>
                </div>
            </div>
        );
    }
}
StatsPanel.contextType = MainContext;
