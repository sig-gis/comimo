import React, { useEffect, useState } from "react";

import ToolCard from "../components/ToolCard";

import { jsonRequest } from "../utils";
import { URLS } from "../constants";
import { useTranslation } from "react-i18next";

export default function StatsPanel({ active, selectedDate, subscribedList }) {
  // State

  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [fetchedFor, setFetchedFor] = useState(false);

  const { t, i18n } = useTranslation();

  // Lifecycle

  useEffect(() => {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(() => {
      setChartsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (chartsLoaded && selectedDate && fetchedFor !== selectedDate) {
      updateStats(selectedDate);
    }
  }, []);

  useEffect(() => {
    updateStats(selectedDate);
  }, [subscribedList]);

  // Helper Functions

  const updateStats = (selectedDate) => {
    getAreaStats();
    getAreaTS();
    setFetchedFor(selectedDate);
  };

  const getAreaStats = () => {
    document.getElementById("stats1").innerHTML = `${t("stats.loading")}...`;
    jsonRequest(URLS.AREA_STATS, { dataLayer: selectedDate })
      .then((data) => {
        if (data.length > 0) {
          const dataTable = new google.visualization.DataTable();
          dataTable.addColumn("string", t("stats.munLabel"));
          dataTable.addColumn("number", t("stats.countLabel"));

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
          document.getElementById("stats1").innerHTML = `<i>${t("stats.noDataFound")}</i>`;
        }
      })
      .catch((e) => console.error(t("stats.errorStats"), e));
  };

  const getAreaTS = () => {
    document.getElementById("stats2").innerHTML = `${t("stats.loading")}...`;
    jsonRequest(URLS.AREA_TOTAL_STATS)
      .then((data) => {
        const sum = data.reduce((acc, [_, c]) => acc + c, 0);
        if (sum > 0.0) {
          const dataTable = new google.visualization.DataTable();

          dataTable.addColumn("string", t("stats.dateLabel"));
          dataTable.addColumn("number", t("stats.countLabel"));

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
          document.getElementById("stats2").innerHTML = `<i>${t("stats.noDataFound")}</i>`;
        }
      })
      .catch((e) => console.error(t("stats.errorStats"), e));
  };

  // Render

  return (
    <ToolCard title={t("stats.regionTitle")} active={active}>
      <div>
        <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{t("stats.regionSubTitle")}</p>
        <div id="stats1" />
        {!chartsLoaded && <div>{`${t("stats.loading")}...`}</div>}
        <h3>{t("stats.dateTitle")}</h3>
        <div id="stats2" />
        {!chartsLoaded && <div>{`${t("stats.loading")}...`}</div>}
        <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{t("stats.areaWarning")}</p>
      </div>
    </ToolCard>
  );
}
