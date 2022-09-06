import React, { useContext } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";

import { PageLayout, MainContext } from "./components/PageLayout";

import { THEME } from "./constants";

const PageContainer = styled.div`
  align-items: center;
  background-color: #313035;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 2rem;
  width: 100%;
`;

const LogoImg = styled.img`
  cursor: pointer;
  max-height: 100%;
  max-width: 100%;
`;

const HeaderContainer = styled.h1`
  color: var(--yellow-brand);
  font: var(--unnamed-font-style-normal) normal bold 32px/32px var(--unnamed-font-family-roboto);
  margin-bottom: 0;
  text-transform: uppercase;
`;

function PageNotFound() {
  const {
    localeText: { home },
  } = useContext(MainContext);

  return (
    <ThemeProvider theme={THEME}>
      <PageContainer>
        <HeaderContainer>{t("home.pageNotFound")}</HeaderContainer>
        <LogoImg
          alt="404-logo"
          src="/img/comimo404.jpg"
          onClick={() => window.location.assign("/")}
        />
      </PageContainer>
    </ThemeProvider>
  );
}

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
      version={args.versionDeployed}
      showSearch={false}
    >
      <PageNotFound />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
