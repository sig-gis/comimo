import React from "react";

import { ThemeProvider } from "@emotion/react";
import AppInfo from "../home/AppInfo";
import Header from "./Header";

import { getLanguage, jsonRequest } from "../utils";
import { THEME } from "../constants";

export const MainContext = React.createContext();
export class PageLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      localeText: {},
      selectedLanguage: ["en", "es"].includes(this.props.userLang)
        ? this.props.userLang
        : getLanguage(["en", "es"]),
      myHeight: 0,
      showInfo: false,
    };
  }

  componentDidMount() {
    this.getLocalText(this.state.selectedLanguage);
    this.updateWindow();
    window.addEventListener("touchend", this.updateWindow);
    window.addEventListener("resize", this.updateWindow);
  }

  /// State Update ///

  selectLanguage = (newLang) => {
    this.setState({ selectedLanguage: newLang });
    this.getLocalText(newLang);
  };

  updateWindow = () => {
    window.scrollTo(0, 0);
    this.setState({ myHeight: window.innerHeight });
  };

  setShowInfo = (showInfo) => this.setState({ showInfo });

  /// API Calls ///

  getLocalText = (lang) =>
    jsonRequest(`/locale/${lang}.json`, {}, "GET").then((data) =>
      this.setState({ localeText: data })
    );

  render() {
    const { myHeight, showInfo, localeText, selectedLanguage } = this.state;
    const { role, username, children, version } = this.props;
    const isAdmin = role === "admin";
    return (
      <MainContext.Provider
        value={{
          isAdmin,
          username,
          localeText,
          myHeight,
          setShowInfo: this.setShowInfo,
        }}
      >
        <ThemeProvider theme={THEME}>
          {showInfo && (
            <AppInfo
              isAdmin={isAdmin}
              localeText={localeText}
              onClose={() => this.setShowInfo(false)}
            />
          )}
          <div
            id="root-component"
            style={{
              height: myHeight,
              width: "100%",
              margin: 0,
              padding: 0,
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Header
              localeText={localeText}
              selectedLanguage={selectedLanguage}
              selectLanguage={this.selectLanguage}
              setShowInfo={this.setShowInfo}
              username={username}
              version={version}
            />
            <div
              id="page-body"
              style={{
                margin: "0px",
                padding: "0px",
                position: "relative",
                flex: "1",
              }}
            />
            {children}
          </div>
        </ThemeProvider>
      </MainContext.Provider>
    );
  }
}
