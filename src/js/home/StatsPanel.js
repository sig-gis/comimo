import React from "react";

import ToolPanel from "../components/ToolPanel";

import { jsonRequest } from "../utils";
import { MainContext } from "../components/PageLayout";
import { URLS } from "../constants";

export default class StatsPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      subsListChanged: false,
      chartsLoaded: false,
      fetchedFor: false,
    };
  }

  componentDidMount() {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(() => {
      this.setState({
        chartsLoaded: true,
      });
    });
  }

  componentDidUpdate(prevProps, prevState) {
    const initialLoad =
      this.state.chartsLoaded &&
      this.props.selectedDate &&
      this.state.fetchedFor !== this.props.selectedDate;

    const refreshNeeded = this.state.subsListChanged && prevProps.isHidden && !this.props.isHidden;

    if (prevProps.subscribedList !== this.props.subscribedList) {
      this.setState({ subsListChanged: true });
    }

    if (initialLoad || refreshNeeded) {
      this.getAreaStats();
      this.getAreaTS();
      this.setState({ fetchedFor: this.props.selectedDate, subsListChanged: false });
    }
  }

  getAreaStats() {
    const { selectedDate } = this.props;
    const {
      localeText: { stats },
    } = this.context;
    document.getElementById("stats1").innerHTML = `${stats.loading}...`;
    jsonRequest(URLS.AREA_STATS, { dataLayer: selectedDate })
      .then((data) => {
        if (data.length > 0) {
          const dataTable = new google.visualization.DataTable();
          dataTable.addColumn("string", stats.munLabel);
          dataTable.addColumn("number", stats.countLabel);

          dataTable.addRows(data);

          const options = {
            title: "Por " + selectedDate,
            width: 290,
            height: 200,
            legend: "none",
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
      .catch((e) => console.error(stats.errorStats, e));
  }

  getAreaTS() {
    const {
      localeText: { stats },
    } = this.context;
    document.getElementById("stats2").innerHTML = `${stats.loading}...`;
    jsonRequest(URLS.AREA_TOTAL_STATS)
      .then((data) => {
        const sum = data.reduce((acc, [_, c]) => acc + c, 0);
        if (sum > 0.0) {
          const dataTable = new google.visualization.DataTable();
          dataTable.addColumn("string", stats.dateLabel);
          dataTable.addColumn("number", stats.countLabel);

          dataTable.addRows(data);

          const options = {
            width: 290,
            height: 200,
            legend: "none",
            hAxis: { slantedText: true },
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
      .catch((e) => console.error(stats.errorStats, e));
  }

  render() {
    const { chartsLoaded } = this.state;
    const {
      localeText: { stats },
    } = this.context;
    return (
      <ToolPanel title={stats.regionTitle}>
        <div>
          <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{stats.regionSubTitle}</p>
          <div id="stats1" />
          {!chartsLoaded && <div>{`${stats.loading}...`}</div>}
          <h3>{stats.dateTitle}</h3>
          <div id="stats2" />
          {!chartsLoaded && <div>{`${stats.loading}...`}</div>}
          <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{stats.areaWarning}</p>
        </div>
      </ToolPanel>
    );
  }
}
StatsPanel.contextType = MainContext;
