import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";

import Divider from "../components/Divider";
import SvgButton from "../collect/SvgButton";
import ToolCard from "../components/ToolCard";

import { URLS } from "../constants";
import { jsonRequest } from "../utils";
import { useTranslation } from "react-i18next";

export default function StatsPanel({ active, selectedDate, subscribedList }) {
  // State

  const { t } = useTranslation();
  const [chartsLoaded, setChartsLoaded] = useState(false);
  const [fetchedFor, setFetchedFor] = useState(false);

  const firstChartIndex = 0;
  const secondChartIndex = 1;
  const [currentChartIdx, setCurrentChartIdx] = useState(firstChartIndex);

  // Lifecycle

  useEffect(() => {
    google.charts.load("current", { packages: ["corechart"] });
    google.charts.setOnLoadCallback(() => {
      setChartsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (chartsLoaded && selectedDate) {
      updateStats(selectedDate, currentChartIdx);
    }
  }, [chartsLoaded, currentChartIdx, selectedDate, subscribedList, fetchedFor]);

  // Helper Functions

  const updateStats = (selectedDate, idx) => {
    if (idx === firstChartIndex) {
      getAreaStats();
    }

    if (idx === secondChartIndex) {
      getAreaTS();
    }
    setFetchedFor(selectedDate);
  };

  const sortAreaData = (data) => {
    // Sort the data response array by end date
    // 1. map over the data response while Splitting the period string into start and end dates.
    // ["01/21 a 01/23", 315] => ["01/21", "01/23", 315]
    // 2. then map the end date string onto the data entries from the initial data array.
    // 3. sort on the prepended end date.
    // [ "2023/08", "2/22 a 08/23", 752 ]
    const sorttedData = data
      .map((row) => row[0].split(" a ").concat(row[1]))
      .map((row, i) => {
        const result = row.map((item, j) => {
          if (j <= 1) {
            const dateArgs = item.replace("/", "/20").split("/").reverse();
            const year = dateArgs[0];
            const month = dateArgs[1];
            return `${year}/${month}`;
          } else {
            return item;
          }
        });
        // Prepend the period end date, as a yyyy-mm formatted date string, and use it as the column to sort on.
        const endDateSort = result[1]; // "2003/08"
        const periodStr = data[i][0]; // "02/22 a 08/23"
        const sumNum = row[row.length - 1]; // number sum
        return [endDateSort, periodStr, sumNum];
      })
      .sort()
      .map(([_, period, sum]) => [period, sum]);

    return sorttedData;
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
          renderSumOfMinedAreas(sortAreaData(data));
        } else {
          document.getElementById("stats2").innerHTML = `<i>${t("stats.noDataFound")}</i>`;
        }
      })
      .catch((e) => console.error(t("stats.errorStats"), e));
  };

  const renderCountOfMinedAreas = (data) => {
    const dataTable = new google.visualization.DataTable();

    dataTable.addColumn("string", t("stats.munLabel"));
    dataTable.addColumn("number", t("stats.countLabel"));
    dataTable.addRows(data.sort());

    const options = {
      is3D: true,
      colors: ["#f9af2f"],
      fillOpacity: 0.3,
      chartArea: { width: "70%", height: "50%" },
      width: 360,
      height: 520,
      legend: { position: "none" },
      title: "Por " + selectedDate,
      titleTextStyle: { color: "#000000" },
      animation: {
        duration: 300,
        easing: "inAndOut",
        startup: true,
      },
      pointShape: {
        type: "triangle",
        rotation: 180,
      },
      annotations: {
        textStyle: {
          fontSize: 10,
          opacity: 0.1,
        },
        boxStyle: {
          stroke: "#888888",
          strokeWidth: 0.5,
          rx: 2,
          ry: 2,
          gradient: {
            color1: "#eeeeee",
            color2: "#dddddd",
            x1: "0%",
            y1: "0%",
            x2: "0%",
            y2: "100%",
            useObjectBoundingBoxUnits: true,
          },
        },
      },
      hAxis: {
        title: "",
        scaleType: "log",
        slantedText: true,
        slantedTextAngle: 48,
      },
      vAxis: {
        scaleType: "log",
        title: t("stats.countLabel"),
        titleTextStyle: {
          fontSize: 12,
        },
      },
    };

    const chart = new google.visualization.ColumnChart(document.getElementById("stats1"));
    chart.draw(dataTable, options);
  };

  const renderSumOfMinedAreas = (data) => {
    const dataTable = new google.visualization.DataTable();

    dataTable.addColumn("string", t("stats.dateLabel"));
    dataTable.addColumn("number", t("stats.countLabel"));
    dataTable.addRows(data);

    const options = {
      is3D: true,
      colors: ["#f9af2f"],
      fillOpacity: 0.3,
      chartArea: { width: "70%" },
      width: 360,
      height: 520,
      legend: "none",
      series: {
        0: {
          type: "bars",
          areaOpacity: 0.3,
        },
      },
      animation: {
        duration: 300,
        easing: "inAndOut",
        startup: true,
      },
      annotations: {
        textStyle: {
          fontSize: 10,
        },
        boxStyle: {
          stroke: "#888888",
          strokeWidth: 0.5,
          rx: 2,
          ry: 2,
          gradient: {
            color1: "#eeeeee",
            color2: "#dddddd",
            x1: "0%",
            y1: "0%",
            x2: "0%",
            y2: "100%",
            useObjectBoundingBoxUnits: true,
          },
        },
      },
      hAxis: {
        slantedText: true,
        slantedTextAngle: 60,
        textStyle: {
          color: "black",
          fontSize: 10,
        },
      },
      vAxis: {
        scaleType: "log",
        textStyle: {
          fontSize: 10,
        },
      },
    };

    const chart = new google.visualization.ColumnChart(document.getElementById("stats2"));
    chart.draw(dataTable, options);
  };

  // Mined areas count per subscribed region
  const MinedAreaPerMunicipality = () => {
    return (
      <div>
        {/* <Title>CHART: Mined Area Per Municipality</Title> */}
        <Title>{t("stats.regionTitle")}</Title>
        <div style={{ display: "flex", justifyContent: "center" }} id="stats1" />
        <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{t("stats.regionSubTitle")}</p>
        {!chartsLoaded && <div>{`${t("stats.loading")}...`}</div>}
        <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{t("stats.areaWarning")}</p>
      </div>
    );
  };

  // Total mined areas for subscribed regions per reporting period
  const SumMinedAreasPerPeriod = () => {
    return (
      <div>
        {/* <Title>CHART: Total Mined Areas Per Period</Title> */}
        <Title>{t("stats.dateTitle")}</Title>
        <div style={{ display: "flex", justifyContent: "center" }} id="stats2" />
        <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{t("stats.regionSubTitle")}</p>
        {!chartsLoaded && <div>{`${t("stats.loading")}...`}</div>}
        <p style={{ lineHeight: "1rem", fontSize: ".75rem" }}>{t("stats.areaWarning")}</p>
      </div>
    );
  };

  return (
    <ToolCard title={t("home.statisticsTitle")} active={active}>
      {currentChartIdx === firstChartIndex ? (
        MinedAreaPerMunicipality()
      ) : currentChartIdx === secondChartIndex ? (
        SumMinedAreasPerPeriod()
      ) : (
        <p>No chart For Index</p>
      )}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <SvgButton
          onClick={() => {
            if (currentChartIdx > 0) {
              setCurrentChartIdx(currentChartIdx - 1);
            }
          }}
          text={t("collect.prev")}
          backgroundColor="var(--white)"
          backgroundColorHover="var(--nav-bar-button)"
          fillColor="black"
          fillColorHover="var(--white)"
          icon="prev"
          iconSize="20px"
          fill="var(--white)"
          isDisabled={currentChartIdx === firstChartIndex}
          extraStyle={{ marginRight: "0.5rem" }}
        />
        <SvgButton
          onClick={() => {
            if (currentChartIdx < secondChartIndex) {
              setCurrentChartIdx(currentChartIdx + 1);
            }
          }}
          text={t("collect.next")}
          backgroundColor="var(--white)"
          backgroundColorHover="var(--nav-bar-button)"
          fillColor="black"
          fillColorHover="var(--white)"
          icon="next"
          iconSize="20px"
          fill="var(--white)"
          isDisabled={currentChartIdx === secondChartIndex}
          extraStyle={{ marginRight: "2rem" }}
        />
      </div>
    </ToolCard>
  );
}

const Title = styled.div`
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium) 16px/19px
    var(--unnamed-font-family-roboto);
  margin-bottom: 1rem;
`;
