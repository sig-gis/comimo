import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";

import {PageLayout} from "../components/PageLayout";
import TitledForm from "../components/TitledForm";

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
  const [userList, setUsers] = useState([]);
  const [logList, setLogs] = useState([]);
  const [selectedPage, setPage] = useState("users");

  useEffect(() => {
    // eslint-disable-next-line no-use-before-define
    getUsers();
    // eslint-disable-next-line no-use-before-define
    getLogs();
  }, []);

  const getUsers = () => jsonRequest(URLS.USERS)
    .then(result => { setUsers(result); });

  const getLogs = () => jsonRequest(URLS.LOGS)
    .then(result => { setLogs(result); });

  /// Render Functions ///

  const renderUserRow = ({userId, username, email, role}) => (
    <GridRow key={userId}>
      <label className="col-1">{userId}</label>
      <label className="col-4">{username}</label>
      <label className="col-5">{email}</label>
      <label className="col-2">{role}</label>
    </GridRow>
  );

  const renderUsers = () => (
    <GridSection>
      {renderUserRow({userId: "Id", username: "Username", email: "Email", role: "Role"})}
      {userList.map(renderUserRow)}
    </GridSection>
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

  return (
    <PageContainer>
      <Content>
        {/* An empty div keeps the form from filling up the entire height. */}
        <div>
          <TitledForm header="Options">
            <div className="d-flex flex-column">
              <OptionRow onClick={() => setPage("users")}>
                Users
              </OptionRow>
              <OptionRow onClick={() => setPage("logs")}>
                <label>Logs</label>
              </OptionRow>
            </div>
          </TitledForm>
        </div>
        <DataArea>
          {selectedPage === "users" && renderUsers()}
          {selectedPage === "logs" && renderLogs()}
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
