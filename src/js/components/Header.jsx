import React from "react";
import Button from "./Button";
import styled from "@emotion/styled";

import LanguageSelector from "./LanguageSelector";
import SvgIcon from "./SvgIcon";

const TitleDiv = styled.div`
  width: 100%;
  background: var(--gray-1);
  text-align: center;
  padding: 5px;
  height: 3.5rem;
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
    <TitleDiv id="title-bar">
      <img
        alt="app-logo"
        onClick={() => window.location.assign("/")}
        src="/img/app-logo.png"
        style={{ height: "100%", cursor: "pointer" }}
      />
      <span
        style={{
          position: "fixed",
          left: "56px",
          top: "35px",
          color: "#7db0b0",
          fontSize: "0.6rem",
        }}
      >
        {version && `Version: ${version}`}
      </span>
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
          <button
            style={{
              alignItems: "center",
              border: "2px solid",
              background: "white",
              borderRadius: "8px",
              display: "flex",
              padding: "2px",
              marginRight: ".5rem",
            }}
            type="button"
          >
            <div
              onClick={() => window.location.assign("/user-account")}
              style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            >
              <span style={{ padding: "0rem 0.5rem" }}>{username}</span>
              <SvgIcon icon="user" size="1.2rem" />
            </div>
          </button>
        ) : (
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
    </TitleDiv>
  );
}
