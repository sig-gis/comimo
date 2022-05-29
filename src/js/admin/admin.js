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

function AdminContent() {
  const {localeText: {admin}} = useContext(MainContext);
  const [userList, setUsers] = useState([]);
  const [savedUserList, setSaveduserlist] = useState([]);
  const [logList, setLogs] = useState([]);
  const [selectedPage, setPage] = useState("users");
  const [roleChanged, setRoleChanged] = useState(false);
  const [availableDates, setAvailableDates] = useState({predictions: [], userMines: []});
  const [collectedData, setCollectedData] = useState({});
  const {predictions, userMines} = availableDates;
  const addCollectedData = (dataLayer, data) => setCollectedData({...collectedData, [dataLayer]: data});

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
      setSaveduserlist(result);
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

  /// Render Functions ///

  const renderUserRow = (user, i) => {
    const {userId, username, email, role} = user;
    return (
      <GridRow key={userId}>
        <label className="col-1">{userId}</label>
        <label className="col-4">{username}</label>
        <label className="col-5">{email}</label>
        {(userId === "Id") ? <label className="col-2">{role} </label>
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
              {["admin", "user"].map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          )}
      </GridRow>
    );
  };

  const renderUsers = () => (
    <>
      <GridSection>
        {renderUserRow({userId: "Id", username: "Username", email: "Email", role: "Role"})}
        {userList.map(renderUserRow)}
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
      {logList.map(renderLogRow)}
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
      collectedData={collectedData}
      predictions={predictions}
      renderButtons={renderButtons}
    />
  );

  const renderUserMines = () => (
    <UserMines
      addCollectedData={addCollectedData}
      collectedData={collectedData}
      renderButtons={renderButtons}
      userMines={userMines}
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
              </OptionRow>
            </div>
          </TitledForm>
        </div>
        <DataArea>
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

class Predictions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: -1,
      tableRef: null
    };
  }

  /// API Calls ///

  loadDateData = dataLayer => {
    const {addCollectedData} = this.props;
    jsonRequest(URLS.PREDICTIONS, {dataLayer})
      .then(data => addCollectedData(dataLayer, data))
      .catch(err => console.error(err));
  };

  /// Helper Functions ///

  downloadData = type => {
    const {tableRef, selectedDate} = this.state;
    tableRef.current.download(type, `validated-predictions-${selectedDate}-data.${type}`);
  };

  render() {
    const {selectedDate} = this.state;
    const {predictions, collectedData, renderButtons} = this.props;
    const {localeText: {admin}} = this.context;

    return (
      <>
        <div>
          <label htmlFor="project-date">Prediction date</label>
          <select
            id="project-date"
            onChange={e => this.setState({selectedDate: e.target.value})}
            style={{padding: ".25rem", borderRadius: "3px", margin: ".75rem"}}
            value={selectedDate}
          >
            {selectedDate === -1 && (
              <option key={-1} value={-1}>{predictions.length > 0 ? admin.selectDate : admin.loadingDates}</option>
            )}
            {predictions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <Button
            disabled={selectedDate === -1}
            onClick={() => this.loadDateData(selectedDate)}
          >
            {collectedData[selectedDate] ? admin.reload : admin.load}
          </Button>
        </div>
        <ReactTabulator
          columns={[
            // define the table columns
            {title: "user", field: "username", headerFilter: "input"},
            {title: "email", field: "email", headerFilter: "input"},
            {title: "organization", field: "institution", headerFilter: "input"},
            {title: "project name", field: "projectName", headerFilter: "input"},
            {title: "latitude", field: "lat", headerFilter: "input"},
            {title: "longitude", field: "lon", headerFilter: "input"},
            {title: "data layer", field: "dataLayer", headerFilter: "input"},
            {title: "mine", field: "answer", headerFilter: "input"}
          ]}
          data={this.props.collectedData[selectedDate]}
          onRef={ref => this.setState({tableRef: ref})}
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
        {renderButtons(this.downloadData)}
      </>
    );
  }
}
Predictions.contextType = MainContext;

class UserMines extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: -1,
      tableRef: null
    };
  }

  /// API Calls ///

  loadDateData = yearMonth => {
    const {addCollectedData} = this.props;
    jsonRequest(URLS.USER_MINES, {yearMonth})
      .then(data => addCollectedData(yearMonth, data))
      .catch(err => console.error(err));
  };

  /// Helper Functions ///

  downloadData = type => {
    const {tableRef, selectedDate} = this.state;
    tableRef.current.download(type, `user-mines-${selectedDate}-data.${type}`);
  };

  render() {
    const {selectedDate} = this.state;
    const {userMines, collectedData, renderButtons} = this.props;
    const {localeText: {admin}} = this.context;

    return (
      <>
        <div>
          <label htmlFor="project-date">Reporting month</label>
          <select
            id="project-date"
            onChange={e => this.setState({selectedDate: e.target.value})}
            style={{padding: ".25rem", borderRadius: "3px", margin: ".75rem"}}
            value={selectedDate}
          >
            {selectedDate === -1 && (
              <option key={-1} value={-1}>{userMines.length > 0 ? admin.selectDate : admin.loadingDates}</option>
            )}
            {userMines.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <Button
            disabled={selectedDate === -1}
            onClick={() => this.loadDateData(selectedDate)}
          >
            {collectedData[selectedDate] ? admin.reload : admin.load}
          </Button>
        </div>
        <ReactTabulator
          columns={[
            // define the table columns
            {title: "user", field: "username", headerFilter: "input"},
            {title: "email", field: "email", headerFilter: "input"},
            {title: "organization", field: "institution", headerFilter: "input"},
            {title: "longitude", field: "lat", headerFilter: "input"},
            {title: "latitude", field: "lon", headerFilter: "input"},
            {title: "reported date", field: "reportedDate", headerFilter: "input"}
          ]}
          data={this.props.collectedData[selectedDate]}
          onRef={ref => this.setState({tableRef: ref})}
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
        {renderButtons(this.downloadData)}
      </>
    );
  }
}
UserMines.contextType = MainContext;

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
