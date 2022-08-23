import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import IconButton from "./IconButton";

const FooterBar = styled.div`
  background-color: var(--gray-1);
  box-shadow: 3px 0px 6px #0000008d;
  display: flex;
  height: 60px;
  justify-content: space-between;
  text-align: center;
  width: 100%;
`;

const Buttons = styled.div`
  flex: 3;
  background-color: white;
`;

const MoreButtons = styled.div`
  flex: 1;
  background-color: red;
`;

const Logo = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: center;
  padding: 5px 0;
`;

const LogoImg = styled.img`
  cursor: pointer;
  height: 100%;
  padding-right: 15px;
  width: 130px;
`;

const LogoGitVersion = styled.a`
  color: var(--white);
  cursor: pointer;
  font-size: 12px;
  letter-spacing: 0px;
  text-align: left;
  text-decoration: none;
`;

export default function Footer({ isAdmin, setShowInfo, version }) {
  return (
    <FooterBar>
      <Buttons></Buttons>
      <MoreButtons>
        {isAdmin && (
          <IconButton
            extraStyle={{ marginRight: "10px" }}
            icon="admin"
            onClick={() => window.location.assign("/admin")}
            // tooltip={home.admin}
          />
        )}
        <IconButton
          icon="info"
          onClick={() => setShowInfo(true)}
          // tooltip={home.appInfoTooltip}
        />
      </MoreButtons>
      <Logo id="footer-info-logo">
        <LogoImg
          alt="app-logo"
          onClick={() => window.location.assign("/")}
          src="/img/app-logo.png"
        />
        <LogoGitVersion href={`https://github.com/sig-gis/comimo/tags/${version}`} target="/blank">
          {version && `Version: ${version}`}
        </LogoGitVersion>
      </Logo>
    </FooterBar>
  );
}
