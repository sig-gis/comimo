import React from "react";

import LanguageSelector from "./LanguageSelector";
import SvgIcon from "./SvgIcon";

export default function Header({selectLanguage, selectedLanguage, username, setShowInfo}) {
  return (
    <div
      id="title-bar"
      style={{
        width: "100%",
        background: "#003333",
        textAlign: "center",
        padding: "5px",
        height: "3.5rem"
      }}
    >
      <img
        alt="app-logo"
        onClick={() => setShowInfo(true)}
        src="/img/app-logo.png"
        style={{height: "100%", cursor: "pointer"}}
      />
      <div
        id="user-panel"
        style={{
          alignItems: "flex-end",
          display: "flex",
          position: "fixed",
          right: "56px",
          top: "10px",
          zIndex: 1000
        }}
      >
        {username && (
          <button
            style={{
              alignItems: "center",
              border: "2px solid",
              background: "white",
              borderRadius: "8px",
              display: "flex",
              padding: "2px",
              marginRight: ".5rem"
            }}
            type="button"
          >
            <div
              onClick={() => window.location.assign("/user-account")}
              style={{display: "flex", alignItems: "center", cursor: "pointer"}}
            >
              <span className="px-2">{username}</span>
              <SvgIcon icon="user" size="1.2rem"/>
            </div>
          </button>
        )}
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          selectLanguage={selectLanguage}
        />
      </div>
    </div>
  );
}
