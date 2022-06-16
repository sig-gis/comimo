import React, {useEffect, useState, useContext} from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
import {ReactTabulator} from "react-tabulator";
import {isEqual} from "lodash";

import {PageLayout, MainContext} from "../components/PageLayout";
import TitledForm from "../components/TitledForm";
import Button from "../components/Button";
import "react-tabulator/lib/styles.css"; // required styles
import "react-tabulator/lib/css/tabulator_bootstrap4.min.css"; // theme

import {URLS} from "../constants";
import {jsonRequest} from "../utils";

const PageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
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
  overflow-y: scroll;
`;

const GridSection = styled.div`
  border: 1px solid black;
  border-radius: .5rem;
  display: flex;
  flex-direction: column;
  margin: 0 1rem;
`;

const GridRow = styled.div`
  display: flex;
  padding: .5rem;
  border-bottom: 1px solid black;

  &:nth-child(even) {
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
  padding: .5rem;

  &:hover {
    filter: brightness(90%);
  }
`;


function makeAdminTableComponent(dateDataURL, columnFields, tableRefDownloadURL) {
  return ({addCollectedData, availableDates, collectedData, renderButtons}) => {
    // STATE
    const [selectedDate, setSelectedDate] = useState(-1);
    const [tableRef, setTableRef] = useState(null);
    const {localeText: {admin}} = useContext(MainContext);

    /// API ///
    const loadDateData = yearMonth =>
      jsonRequest(dateDataURL, {yearMonth})
        .then(data => addCollectedData(yearMonth, data))
        .catch(err => console.error(err));

    /// Helper Functions ///
    const downloadData = type =>
      tableRef.current.download(type, `${tableRefDownloadURL}-${selectedDate}-data.${type}`);

    return (
      <>
        <div>
          <label htmlFor="project-date">Reporting month</label>
          <select
            id="project-date"
            onChange={e => setSelectedDate(e.target.value)}
            style={{padding: ".25rem", borderRadius: "3px", margin: ".75rem"}}
            value={selectedDate}
          >
            {selectedDate === -1 && (
              <option key={-1} value={-1}>{availableDates.length > 0 ? admin.selectDate : admin.loadingDates}</option>
            )}
            {availableDates.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <Button
            disabled={selectedDate === -1}
            onClick={() => loadDateData(selectedDate)}
          >
            {collectedData[selectedDate] ? admin.reload : admin.load}
          </Button>
        </div>
        <ReactTabulator
          columns={columnFields.map(m => ({...m, headerFilter: "input"}))}
          data={collectedData[selectedDate]}
          onRef={ref => setTableRef(ref)}
          options={{
            layout: "fitColumns", // fit columns to width of table
            responsiveLayout: "hide", // hide columns that dont fit on the table
            tooltips: true, // show tool tips on cells
            addRowPos: "top", // when adding a new row, add it to the top of the table
            history: true, // allow undo and redo actions on the table
            pagination: "local",
            paginationSize: 100,
            movableColumns: true, // allow column order to be changed
            resizableRows: true // allow row order to be changed
          }}
        />
        {renderButtons(downloadData)}
      </>
    );
  };
}

const UserMines = makeAdminTableComponent(URLS.USER_MINES,
                                          [{title: "user",          field: "username"},
                                           {title: "email",         field: "email"},
                                           {title: "organization",  field: "institution"},
                                           {title: "latitude",      field: "lat"},
                                           {title: "longitude",     field: "lon"},
                                           {title: "reported date", field: "reportedDate"}],
                                          "user-mines");

const Predictions = makeAdminTableComponent(URLS.PREDICTIONS,
                                            [{title: "user",         field: "username"},
                                             {title: "email",        field: "email"},
                                             {title: "organization", field: "institution"},
                                             {title: "project name", field: "projectName"},
                                             {title: "latitude",     field: "lat"},
                                             {title: "longitude",    field: "lon"},
                                             {title: "data layer",   field: "dataLayer"},
                                             {title: "mine",         field: "answer"}],
                                            "validated-predictions");

const Filter = styled.input`
  margin: 0 0 1rem 1rem;
`;

function AdminContent() {
  const {localeText: {admin}} = useContext(MainContext);
  const [userList, setUsers] = useState([]);
  const [savedUserList, setSavedUserList] = useState([]);
  const [logList, setLogs] = useState([]);
  const [selectedPage, setPage] = useState("users");
  const [roleChanged, setRoleChanged] = useState(false);
  const [availableDates, setAvailableDates] = useState({predictions: [], userMines: []});
  const [collectedData, setCollectedData] = useState({});
  const {predictions, userMines} = availableDates;
  const addCollectedData = (dataLayer, data) => setCollectedData({...collectedData, [dataLayer]: data});
  const [filterStr, setFilterStr] = useState("");

  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    getUsers();
    // eslint-disable-next-line no-use-before-define
    getLogs();
    // eslint-disable-next-line no-use-before-define
    loadDates();
  }, []);

  const getUsers = () => jsonRequest(URLS.USERS)
    .then(result => {
      setUsers(result);
      setSavedUserList(result);
    });

  const getLogs = () => jsonRequest(URLS.LOGS)
    .then(result => setLogs(result));

  const updateUserRoles = _ => {
    const updatedUserList = userList.filter((u, i) => u.role !== savedUserList[i].role);
    jsonRequest(
      "/update-user-role",
      {updatedUserList}
    )
      .then(resp => {
        if (resp === "") {
          getUsers();
          setRoleChanged(isEqual(userList, savedUserList));
        } else {
          console.error(resp);
          alert(admin?.errorRoleUpdate);
        }
      })
      .catch(err => console.error(err));
  };

  const loadDates = () =>
    jsonRequest(URLS.DATA_DATES)
      .then(data => setAvailableDates(data))
      .catch(err => console.error(err));

  const isRowIncluded = row => Object.values(row).join("").includes(filterStr);

  /// Render Functions ///

  const renderUserRow = (user, i) => {
    const {userId, username, email, role} = user;
    return (
      <GridRow key={userId}>
        <label className="col-1">{userId}</label>
        <label className="col-4">{username}</label>
        <label className="col-5">{email}</label>
        {(userId === "Id")
         ? <label className="col-2">{role}</label>
         : (
           <select
             className="w-20"
             id="role-selection"
             onChange={e => {
               setUsers([...(userList.slice(0, i)), {...user, role: e.target.value}, ...userList.slice(i + 1)]);
               setRoleChanged(isEqual(userList, savedUserList));
             }}
             value={role}
           >
             {["admin", "user"].map(r => <option key={r} value={r}>{r}</option>)}
           </select>
         )}
      </GridRow>
    );
  };

  const renderUsers = () => (
    <>
      <GridSection>
        {renderUserRow({userId: "Id", username: "Username", email: "Email", role: "Role"})}
       {userList.filter(row => isRowIncluded(row)).map(renderUserRow)}
      </GridSection>
      <div className="m-3 d-flex">
        <div className="flex-grow-1"/>
        <Button
          disabled={!roleChanged}
          onClick={updateUserRoles}
        >
          {admin?.save}
        </Button>
      </div>
    </>
  );

  const renderLogRow = ({jobTime, username, finishStatus, finishMessage}) => (
    <GridRow key={jobTime + username}>
      <label className="col-3">{jobTime}</label>
      <label className="col-3">{username}</label>
      <label className="col-3">{finishStatus}</label>
      <label className="col-3">{finishMessage}</label>
    </GridRow>
  );

  const renderLogs = () => (
    <GridSection>
      {renderLogRow({jobTime: "Time", username: "Username", finishStatus: "Status", finishMessage: "Message"})}
      {logList.filter(row => isRowIncluded(row)).map(renderLogRow)}
    </GridSection>
  );

  const renderButtons = downloadData => (
    <div
      style={{
        textAlign: "right",
        padding: "1rem 0",
        width: "100%"
      }}
    >
      <Button
        className="mr-1"
        onClick={() => downloadData("csv")}
      >
        {admin.downloadCSV}
      </Button>
      <Button
        onClick={() => downloadData("json")}
      >
        {admin.downloadJSON}
      </Button>
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
            <div className="d-flex flex-column">
              <OptionRow onClick={() => setPage("users")}>
                {admin?.users}
              </OptionRow>
              <OptionRow onClick={() => setPage("logs")}>
                <label>{admin?.logs}</label>
              </OptionRow>
              <OptionRow onClick={() => setPage("predictions")}>
                <label>{admin?.predictions}</label>
              </OptionRow>
              <OptionRow onClick={() => setPage("userMines")}>
                <label>{admin?.userMines}</label>
              <OptionRow
                onClick={() => {
                  setFilterStr("");
                  setPage("users");
                }}
              >
                Users
              </OptionRow>
              <OptionRow
                onClick={() => {
                  setFilterStr("");
                  setPage("logs");
                }}
              >
                <label>Logs</label>
              </OptionRow>
            </div>
          </TitledForm>
        </div>
        <DataArea>
          <Filter
            onChange={e => setFilterStr(e.target.value)}
            placeholder="Filter"
            value={filterStr}
          />
          {selectedPage === "users" && renderUsers()}
          {selectedPage === "logs" && renderLogs()}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              padding: "1rem 4rem",
              alignItems: "center",
              height: "100%"
            }}
          >
            {selectedPage === "predictions" && renderPredictions()}
            {selectedPage === "userMines" && renderUserMines()}
          </div>
        </DataArea>
      </Content>
    </PageContainer>
  );
}

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
    >
      <AdminContent/>
    </PageLayout>,
    document.getElementById("main-container")
  );
}
