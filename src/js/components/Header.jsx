import React from "react";
import Button from "./Button";
import styled from "@emotion/styled";

import LanguageSelector from "./LanguageSelector";
import IconButton from "./IconButton";

const TitleBar = styled.div`
  width: 100%;
  background: var(--gray-1);
  text-align: center;
  padding: 5px;
  height: 3.5rem;
  display: flex;
  justify-content: space-between;
`;

const Search = styled.div`
  flex: 1;
`;

const Logo = styled.div`
  display: relative;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  flex: 1;
`;

const LogoImg = styled.img`
  width: 130px;
  height: 43px;
  cursor: pointer;
`;

const LogoGitVersion = styled.span`
  position: relative;
  left: -90px;
  bottom: 0px;
  color: var(--white);
  text-align: left;
  font-size: 12px;
  letter-spacing: 0px;
`;

const UserSettings = styled.div`
  flex: 1;
`;

const LoggedInUserPanel = styled.div`
  align-items: center;
  display: flex;
  cursor: pointer;
`;

const LoggedInUsername = styled.span`
  text-align: left;
  font-size: 18px;
  font-weight: var(--unnamed-font-weight-medium);
  letter-spacing: 0px;
  color: var(--white);
  padding: 0 0.5rem;

  &:hover {
    text-decoration: underline;
  }
`;

export default function Header({
  selectLanguage,
  selectedLanguage,
  username,
  setShowInfo,
  localeText,
  version,
}) {
  return (
    <TitleBar id="title-bar">
      <Search>
        <button>test</button>
      </Search>
      <Logo>
        <LogoImg
          alt="app-logo"
          onClick={() => window.location.assign("/")}
          src="/img/app-logo.png"
          style={{ height: "100%", cursor: "pointer" }}
        />
        <LogoGitVersion>prod-2022-08-01</LogoGitVersion>
        {/* <LogoGitVersion>{version && `Version: ${version}`}</LogoGitVersion> */}
      </Logo>
      <UserSettings>
        <div
          id="user-panel"
          style={{
            alignItems: "center",
            display: "flex",
            position: "fixed",
            right: "56px",
            top: "10px",
            zIndex: 1000,
          }}
        >
          {username ? (
            // TODO: onClick should open up the menu with the Account Settings, Notifications, and Subscribed Muncipalities buttons
            <LoggedInUserPanel onClick={() => window.location.assign("/user-account")}>
              <IconButton icon="user" size="26px" tooltip="place holder tooltip" />
              <LoggedInUsername>{username}</LoggedInUsername>
            </LoggedInUserPanel>
          ) : (
            // TODO: Make this a styled component
            <Button
              style={{ margin: "0.25rem" }}
              onClick={() => {
                window.location.assign("/login");
              }}
            >
              {localeText.users?.login}
            </Button>
          )}
          <LanguageSelector selectedLanguage={selectedLanguage} selectLanguage={selectLanguage} />
        </div>
      </UserSettings>
    </TitleBar>
  );
}
