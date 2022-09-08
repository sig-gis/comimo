import React from "react";
import Button from "./Button";
import { useAtom, useAtomValue } from "jotai";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

import LanguageSelector from "./LanguageSelector";
import IconTextButton from "./IconTextButton";
import Search from "./Search";
import ToolCard from "./ToolCard";

import { visiblePanelAtom, featureNamesAtom } from "../home";
import { mapquestKeyAtom } from "./PageLayout";

const TitleBar = styled.div`
  background: var(--gray-1);
  box-shadow: 0px 3px 6px #0000008d;
  display: flex;
  height: var(--bar-height);
  justify-content: space-between;
  text-align: center;
  width: 100%;
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: center;
  flex: 1;
`;

const Logo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
`;

const LogoImg = styled.img`
  cursor: pointer;
  height: 43px;
  width: 130px;
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

export default function Header({ setShowInfo, showSearch, username, version }) {
  const featureNames = useAtomValue(featureNamesAtom);
  const mapquestKey = useAtomValue(mapquestKeyAtom);
  const [visiblePanel, setVisiblePanel] = useAtom(visiblePanelAtom);

  const { t, i18n } = useTranslation();

  const togglePanel = (panelKey) => {
    setVisiblePanel(panelKey === visiblePanel ? null : panelKey);
  };

  return (
    <TitleBar id="title-bar">
      <SearchContainer id="header-search">
        {showSearch && (
          <>
            <IconTextButton
              active={visiblePanel === "search"}
              hasBackground={true}
              icon="search"
              // iconSize="26px"
              invertBorderRadius={true}
              onClick={() => togglePanel("search")}
              text={t("home.searchTitle")}
            />
            <ToolCard
              title={"home.searchTitle"}
              isInverted={true}
              active={visiblePanel === "search"}
            >
              <Search isPanel={true} featureNames={featureNames} mapquestKey={mapquestKey}></Search>
            </ToolCard>
          </>
        )}
      </SearchContainer>
      <Logo id="header-logo">
        <LogoImg
          alt="app-logo"
          onClick={() => window.location.assign("/")}
          src="/img/app-logo.png"
        />
      </Logo>
      <UserSettings id="user-settings">
        {username ? (
          // TODO: onClick should open up the menu with the Account Settings, Notifications, and Subscribed Muncipalities buttons
          <LoggedInUserPanel>
            <IconTextButton
              active={false}
              hasBackground={false}
              icon="user"
              iconSize="26px"
              onClick={() => window.location.assign("/user-account")}
              text={username}
              tooltip="Placeholder ToolTip"
            />
          </LoggedInUserPanel>
        ) : (
          <Button
            onClick={() => {
              window.location.assign("/login");
            }}
          >
            {t("users.login")}
          </Button>
        )}
        <LanguageSelector
          style={{ marginRight: "80px", paddingRight: "120px" }}
          selectedLanguage={i18n.language}
          selectLanguage={(lng) => i18n.changeLanguage(lng)}
        />
      </UserSettings>
    </TitleBar>
  );
}
