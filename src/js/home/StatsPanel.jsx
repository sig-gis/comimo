import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import ToolCard from "../components/ToolCard";
import Divider from "../components/Divider";

import { jsonRequest } from "../utils";
import { URLS } from "../constants";
import { useTranslation } from "react-i18next";

export default function StatsPanel({ active, selectedDate, subscribedList }) {
  // State

  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [fetchedFor, setFetchedFor] = useState(false);

  const { t } = useTranslation();

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
  }, [chartsLoaded, selectedDate, subscribedList, fetchedFor]);

  // Helper Functions

  const updateStats = (selectedDate) => {
    // getAreaStats();
    getAreaStaticStats();
    // getAreaTS();
    getAreaStaticTS();
    setFetchedFor(selectedDate);
  };

  const getAreaStaticStats = () => {
    const data = [
      ["TULU\u00c1", 3],
      ["LA JAGUA DE IBIRICO", 509],
      ["ANSERMANUEVO", 8],
      ["CARTAGENA DE INDIAS De Las Indias Cartagenas", 18],
      ["MANAURE", 10],
    ];

    renderCountOfMinedAreas(data);
  };

  const getAreaStaticTS = () => {
    const data = [
      ["01/21 a 01/23", 315],
      ["01/21 a 01/22", 509],
      ["01/21 a 08/22", 513],
      ["01/21 a 06/23", 548],
      ["01/21 a 11/21", 507],
      ["01/21 a 05/21", 1],
      ["01/21 a 10/22", 522],
      ["01/21 a 04/23", 537],
      ["01/21 a 09/21", 84],
      ["01/21 a 02/23", 315],
      ["01/21 a 02/22", 509],
    ];

    renderSumOfMinedAreas(data);
  };

  const getAreaStats = () => {
    document.getElementById("stats1").innerHTML = `${t("stats.loading")}...`;
    jsonRequest(URLS.AREA_STATS, { dataLayer: selectedDate })
      .then((data) => {
        if (data.length > 0) {
          renderCountOfMinedAreas(data);
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
          renderSumOfMinedAreas(data);
        } else {
          document.getElementById("stats2").innerHTML = `<i>${t("stats.noDataFound")}</i>`;
        }
      })
      .catch((e) => console.error(t("stats.errorStats"), e));
  };

  const renderCountOfMinedAreas = (data) => {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: "string", role: "domain" });
    dataTable.addColumn({ type: "number", role: "data" });

    // dataTable.addColumn("string", t("stats.munLabel"));
    // dataTable.addColumn("number", t("stats.countLabel"));
    dataTable.addRows(data.sort());

    const options = {
      bars: "horizontal",
      chartArea: { width: "40%" },
      width: 500,
      height: 240,
      legend: "none",
      title: "Por " + selectedDate,
      animation: {
        duration: 1500,
        easing: "linear",
        startup: true,
      },
      annotations: {
        textStyle: {
          color: "black",
          fontSize: 10,
        },
      },
      hAxis: {
        scaleType: "log",
        slantedText: true,
        slantedTextAngle: 60,
        textStyle: {
          color: "black",
          fontSize: 10,
        },
        title: t("stats.countLabel"),
        titleTextStyle: {
          color: "black",
          fontSize: 10,
        },
      },
      vAxis: {
        slantedText: true,
        slantedTextAngle: 45,
        textStyle: {
          color: "black",
          fontSize: 10,
        },
      },
    };
    new google.visualization.BarChart(document.getElementById("stats1")).draw(dataTable, options);
  };

  const renderSumOfMinedAreas = (data) => {
    const dataTable = new google.visualization.DataTable();

    dataTable.addColumn("string", t("stats.dateLabel"));
    dataTable.addColumn("number", t("stats.countLabel"));
    dataTable.addRows(data);

    const options = {
      chartArea: { width: "50%" },
      width: 500,
      height: 280,
      legend: "none",
      animation: {
        duration: 1500,
        easing: "linear",
        startup: true,
      },
      annotations: {
        textStyle: {
          fontSize: 10,
          color: "black",
        },
      },
      hAxis: {
        slantedText: true,
        slantedTextAngle: 45,
        textStyle: {
          color: "black",
          fontSize: 10,
        },
      },
      vAxis: {
        scaleType: "log",
        slantedText: true,
        slantedTextAngle: 60,
        textStyle: {
          color: "black",
          fontSize: 10,
        },
        title: t("stats.countLabel"),
        titleTextStyle: {
          color: "black",
          fontSize: 10,
        },
      },
    };

    const chart = new google.visualization.ColumnChart(document.getElementById("stats2"));
    chart.draw(dataTable, options);
  };

  return (
    <ToolCard title={t("home.statisticsTitle")} active={active}>
      <div>
        <Title>{t("stats.regionTitle")}</Title>
        <div style={{ display: "flex", justifyContent: "center" }} id="stats1" />
        <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{t("stats.regionSubTitle")}</p>
        {!chartsLoaded && <div>{`${t("stats.loading")}...`}</div>}
        <Divider />
        <Title>{t("stats.dateTitle")}</Title>
        <div style={{ display: "flex", justifyContent: "center" }} id="stats2" />
        {!chartsLoaded && <div>{`${t("stats.loading")}...`}</div>}
        <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{t("stats.areaWarning")}</p>
      </div>
    </ToolCard>
  );
}

const Title = styled.div`
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium) 16px/19px
    var(--unnamed-font-family-roboto);
  margin-bottom: 1rem;
`;
