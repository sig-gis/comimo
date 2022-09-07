import React, { useEffect, useState, useContext, Suspense } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { ReactTabulator } from "react-tabulator";
import { isEqual } from "lodash";

import { PageLayout, MainContext } from "./components/PageLayout";
import TitledForm from "./components/TitledForm";
import Button from "./components/Button";
import "react-tabulator/lib/styles.css"; // required styles
import "react-tabulator/lib/css/tabulator_bootstrap4.min.css"; // theme

import { URLS } from "./constants";
import { jsonRequest } from "./utils";
import { useTranslation } from "react-i18next";

const PageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  width: 100%;
`;

const Content = styled.div`
  display: flex;
  justify-content: start;
  padding: 1rem;
  width: 100%;
  height: 100%;
`;

const DataArea = styled.div`
  flex: 1;
  height: 100%;
  overflow-y: auto;
  padding: 1rem 1rem;
`;

const GridSection = styled.div`
  border: 1px solid black;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  margin: 0 1rem;
`;

const GridRow = styled.div`
  display: flex;
  padding: 0.5rem;
  border-bottom: 1px solid black;

  &:nth-of-type(even) {
    background-color: rgba(10, 10, 10, 0.1);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const OptionRow = styled.div`
  background: white;
  cursor: pointer;
  display: flex;
  padding: 0.5rem;

  &:hover {
    filter: brightness(90%);
  }
`;

const EmptyMessage = styled.div`
  border: 1px solid black;
  border-radius: 0.5rem;
  display: flex;
  margin-bottom: 1rem;
  padding: 1rem 1rem;
`;

function makeAdminTableComponent(dateDataURL, columnFields, tableRefDownloadURL) {
  return ({ addCollectedData, availableDates, collectedData, renderButtons }) => {
    // STATE
    const [selectedDate, setSelectedDate] = useState(-1);
    const [tableRef, setTableRef] = useState(null);

    const { t, i18n } = useTranslation();

    /// API ///
    const loadDateData = (dataLayer) =>
      jsonRequest(dateDataURL, { dataLayer })
        .then((data) => addCollectedData(dataLayer, data))
        .catch((err) => console.error(err));

    /// Helper Functions ///
    const downloadData = (type) =>
      tableRef.current.download(type, `${tableRefDownloadURL}-${selectedDate}-data.${type}`);

    return (
      <>
        <div>
          <label htmlFor="project-date">Reporting month</label>
          <select
            id="project-date"
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: ".25rem", borderRadius: "3px", margin: ".75rem" }}
            value={selectedDate}
          >
            {selectedDate === -1 && (
              <option key={-1} value={-1}>
                {availableDates.length > 0 ? t("admin.selectDate") : t("admin.loadingDates")}
              </option>
            )}
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <Button onClick={() => loadDateData(selectedDate)} isDisabled={selectedDate === -1}>
            {collectedData[selectedDate] ? t("admin.reload") : t("admin.load")}
          </Button>
        </div>
        <div>
          {selectedDate === -1 && <EmptyMessage>{t("admin.emptyTable")}</EmptyMessage>}
          {collectedData[selectedDate]?.length > 0 && (
            <>
              <ReactTabulator
                columns={columnFields.map((m) => ({ ...m, headerFilter: "input" }))}
                data={collectedData[selectedDate]}
                onRef={(ref) => setTableRef(ref)}
                options={{
                  layout: "fitColumns", // fit columns to width of table
                  responsiveLayout: "hide", // hide columns that dont fit on the table
                  addRowPos: "top", // when adding a new row, add it to the top of the table
                  history: true, // allow undo and redo actions on the table
                  pagination: "local",
                  paginationSize: 100,
                  movableColumns: true, // allow column order to be changed
                  resizableRows: true, // allow row order to be changed
                }}
              />
              {renderButtons(downloadData)}
            </>
          )}
          {selectedDate !== -1 && collectedData[selectedDate]?.length === 0 && (
            <EmptyMessage>{t("admin.noData")}</EmptyMessage>
          )}
        </div>
      </>
    );
  };
}

const UserMines = makeAdminTableComponent(
  URLS.USER_MINES,
  [
    { title: "Username", field: "username", headerFilterPlaceholder: "Filter" },
    { title: "Email", field: "email", headerFilterPlaceholder: "Filter" },
    { title: "Organization", field: "institution", headerFilterPlaceholder: "Filter" },
    { title: "Latitude", field: "lat", headerFilterPlaceholder: "Filter" },
    { title: "Longitude", field: "lon", headerFilterPlaceholder: "Filter" },
    { title: "Reported date", field: "reportedDate", headerFilterPlaceholder: "Filter" },
  ],
  "user-mines"
);

const Predictions = makeAdminTableComponent(
  URLS.PREDICTIONS,
  [
    { title: "Username", field: "username", headerFilterPlaceholder: "Filter" },
    { title: "Email", field: "email", headerFilterPlaceholder: "Filter" },
    { title: "Organization", field: "institution", headerFilterPlaceholder: "Filter" },
    { title: "Project name", field: "projectName", headerFilterPlaceholder: "Filter" },
    { title: "Latitude", field: "lat", headerFilterPlaceholder: "Filter" },
    { title: "Longitude", field: "lon", headerFilterPlaceholder: "Filter" },
    { title: "Data layer", field: "dataLayer", headerFilterPlaceholder: "Filter" },
    { title: "Mine", field: "answer", headerFilterPlaceholder: "Filter" },
  ],
  "validated-predictions"
);

const Filter = styled.input`
  margin: 0 0 1rem 1rem;
  padding-left: 0.5rem;
`;

function AdminContent() {
  const [userList, setUsers] = useState([]);
  const [savedUserList, setSavedUserList] = useState([]);
  const [logList, setLogs] = useState([]);
  const [selectedPage, setPage] = useState("users");
  const [roleChanged, setRoleChanged] = useState(false);
  const [availableDates, setAvailableDates] = useState({ predictions: [], userMines: [] });
  const [collectedData, setCollectedData] = useState({});
  const { predictions, userMines } = availableDates;
  const addCollectedData = (dataLayer, data) =>
    setCollectedData({ ...collectedData, [dataLayer]: data });
  const [filterStr, setFilterStr] = useState("");

  const { t } = useTranslation();
  useEffect(() => {
    getUsers();
    getLogs();
    loadDates();
  }, []);

  const getUsers = () =>
    jsonRequest(URLS.USERS).then((result) => {
      setUsers(result);
      setSavedUserList(result);
    });

  const getLogs = () => jsonRequest(URLS.LOGS).then((result) => setLogs(result));

  const updateUserRoles = (_) => {
    const updatedUserList = userList.filter((u, i) => u.role !== savedUserList[i].role);
    jsonRequest("/update-user-role", { updatedUserList })
      .then((resp) => {
        if (resp === "") {
          getUsers();
          setRoleChanged(isEqual(userList, savedUserList));
        } else {
          console.error(resp);
          alert(t("admin.errorRoleUpdate"));
        }
      })
      .catch((err) => console.error(err));
  };

  const loadDates = () =>
    jsonRequest(URLS.DATA_DATES)
      .then((data) => setAvailableDates(data))
      .catch((err) => console.error(err));

  const isRowIncluded = (row) => Object.values(row).join("").includes(filterStr);

  /// Render Functions ///

  const renderUserRow = (user, i) => {
    const { userId, username, email, role } = user;
    return (
      <GridRow
        style={{ display: "grid", justifyItems: "center", gridTemplateColumns: "1fr 4fr 5fr 2fr" }}
        key={userId}
      >
        <label>{userId}</label>
        <label>{username}</label>
        <label>{email}</label>
        {userId === "Id" ? (
          <label>{role}</label>
        ) : (
          <select
            id="role-selection"
            onChange={(e) => {
              setUsers([
                ...userList.slice(0, i),
                { ...user, role: e.target.value },
                ...userList.slice(i + 1),
              ]);
              setRoleChanged(isEqual(userList, savedUserList));
            }}
            value={role}
          >
            {["admin", "user"].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
      </GridRow>
    );
  };

  const renderUsers = () =>
    userList.filter((row) => isRowIncluded(row)).map(renderUserRow).length ? (
      <>
        <Filter
          onChange={(e) => setFilterStr(e.target.value)}
          placeholder="Filter"
          value={filterStr}
        />
        <GridSection>
          {renderUserRow({
            userId: t("admin.id"),
            username: t("admin.username"),
            email: t("admin.email"),
            role: t("admin.role"),
          })}
          {userList.filter((row) => isRowIncluded(row)).map(renderUserRow)}
        </GridSection>
        <div style={{ margin: "1rem", display: "flex" }}>
          <div style={{ display: "flex", flexGrow: "1" }} />
          <Button onClick={updateUserRoles} isDisabled={!roleChanged}>
            {t("admin.save")}
          </Button>
        </div>
      </>
    ) : (
      <>
        <Filter
          onChange={(e) => setFilterStr(e.target.value)}
          placeholder="Filter"
          value={filterStr}
        />
        <EmptyMessage>{t("admin.emptyUsers")}</EmptyMessage>
      </>
    );

  const renderLogRow = ({ jobTime, username, finishStatus, finishMessage }) => (
    <GridRow
      style={{ display: "grid", justifyItems: "center", gridTemplateColumns: "repeat(4, 3fr)" }}
      key={jobTime + username}
    >
      <label>{jobTime}</label>
      <label>{username}</label>
      <label>{finishStatus}</label>
      <label>{finishMessage}</label>
    </GridRow>
  );

  const renderLogs = () =>
    logList.filter((row) => isRowIncluded(row)).map(renderLogRow).length ? (
      <>
        <Filter
          onChange={(e) => setFilterStr(e.target.value)}
          placeholder="Filter"
          value={filterStr}
        />
        <GridSection>
          {renderLogRow({
            jobTime: "Time",
            username: "Username",
            finishStatus: "Status",
            finishMessage: "Message",
          })}
          {logList.filter((row) => isRowIncluded(row)).map(renderLogRow)}
        </GridSection>
      </>
    ) : (
      <>
        <Filter
          onChange={(e) => setFilterStr(e.target.value)}
          placeholder="Filter"
          value={filterStr}
        />
        <EmptyMessage>{t("admin.emptyLogs")}</EmptyMessage>
      </>
    );

  const renderButtons = (downloadData) => (
    <div
      style={{
        textAlign: "right",
        padding: "1rem 0",
        width: "100%",
      }}
    >
      <Button onClick={() => downloadData("csv")} extraStyle={{ marginRight: "0.5rem" }}>
        {t("admin.downloadCSV")}
      </Button>
      <Button onClick={() => downloadData("json")}>{t("admin.downloadJSON")}</Button>
    </div>
  );

  const renderPredictions = () => (
    <Predictions
      addCollectedData={addCollectedData}
      availableDates={predictions}
      collectedData={collectedData}
      renderButtons={renderButtons}
    />
  );

  const renderUserMines = () => (
    <UserMines
      addCollectedData={addCollectedData}
      availableDates={userMines}
      collectedData={collectedData}
      renderButtons={renderButtons}
    />
  );

  return (
    <PageContainer>
      <Content>
        {/* An empty div keeps the form from filling up the entire height. */}
        <div>
          <TitledForm header="Options">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <OptionRow
                onClick={() => {
                  setFilterStr("");
                  setPage("users");
                }}
              >
                {t("admin.users")}
              </OptionRow>
              <OptionRow
                onClick={() => {
                  setFilterStr("");
                  setPage("logs");
                }}
              >
                {t("admin.logs")}
              </OptionRow>
              <OptionRow onClick={() => setPage("predictions")}>{t("admin.predictions")}</OptionRow>
              <OptionRow onClick={() => setPage("userMines")}>{t("admin.userMines")}</OptionRow>
            </div>
          </TitledForm>
        </div>
        <DataArea>
          {selectedPage === "users" && renderUsers()}
          {selectedPage === "logs" && renderLogs()}
          {selectedPage === "predictions" && renderPredictions()}
          {selectedPage === "userMines" && renderUserMines()}
        </DataArea>
      </Content>
    </PageContainer>
  );
}

export function pageInit(args) {
  ReactDOM.render(
    <Suspense fallback="">
      <PageLayout
        role={args.role}
        username={args.username}
        version={args.versionDeployed}
        showSearch={false}
      >
        <AdminContent />
      </PageLayout>
    </Suspense>,
    document.getElementById("main-container")
  );
}
