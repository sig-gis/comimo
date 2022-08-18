import React from "react";
import Button from "./Button";
import styled from "@emotion/styled";

import LanguageSelector from "./LanguageSelector";
import IconTextButton from "./IconTextButton";

const TitleBar = styled.div`
  background: var(--gray-1);
  display: flex;
  height: 60px;
  justify-content: space-between;
  text-align: center;
  width: 100%;
`;

const Search = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const Logo = styled.div`
  align-items: center;
  display: relative;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 5px 0;
`;

const LogoImg = styled.img`
  cursor: pointer;
  height: 43px;
  width: 130px;
`;

const LogoGitVersion = styled.span`
  bottom: 0px;
  color: var(--white);
  font-size: 12px;
  left: -90px;
  letter-spacing: 0px;
  position: relative;
  text-align: left;
`;

const UserSettings = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: space-around;
`;

const LoggedInUserPanel = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
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
      <Search id="header-search">
        {/* TODO: onClick should open up the Search functionality
        TODO: have an active state that we can pass to IconTextButton */}
        <IconTextButton
          active={false}
          clickHandler={() => window.alert("place holder for search functionality")}
          hasBackground={true}
          icon="search"
          iconSize="26px"
          invertBorderRadius={true}
          text="Search"
          tooltip="Placeholder Search ToolTip"
        />
      </Search>
      <Logo id="header-logo">
        <LogoImg
          alt="app-logo"
          onClick={() => window.location.assign("/")}
          src="/img/app-logo.png"
          style={{ height: "100%", cursor: "pointer" }}
        />
        <LogoGitVersion>prod-2022-08-01</LogoGitVersion>
        {/* <LogoGitVersion>{version && `Version: ${version}`}</LogoGitVersion> */}
      </Logo>
      <UserSettings id="user-settings">
        {username ? (
          // TODO: onClick should open up the menu with the Account Settings, Notifications, and Subscribed Muncipalities buttons
          // TODO: have an active state that we can pass to IconTextButton
          <LoggedInUserPanel>
            <IconTextButton
              active={false}
              clickHandler={() => window.location.assign("/user-account")}
              hasBackground={false}
              icon="user"
              iconSize="26px"
              text={username}
              tooltip="Placeholder ToolTip"
            />
          </LoggedInUserPanel>
        ) : (
          <Button
            buttonText={localeText.users?.login}
            clickHandler={() => {
              window.location.assign("/login");
            }}
          />
        )}
        <LanguageSelector selectedLanguage={selectedLanguage} selectLanguage={selectLanguage} />
      </UserSettings>
    </TitleBar>
  );
}
