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

  getLocalText = (lang) => {
    jsonRequest(`/locale/${lang}.json`, null, "GET")
      .then((data) => this.setState({ localeText: data }))
      .catch((err) => console.error(err));
  };

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
          {showInfo && <AppInfo isAdmin={isAdmin} onClose={() => this.setShowInfo(false)} />}
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
            <style jsx global>{`
              *,
              ::before,
              ::after {
                box-sizing: border-box;
                border-width: 0;
                border-style: solid;
                border-color: #e5e7eb;
              }

              html,
              body {
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                font-family: "Roboto Condensed", sans-serif !important;
                line-height: 1.5rem !important;
                font-size: 16px;
                -webkit-text-size-adjust: 100%;
                -moz-tab-size: 4;
                -o-tab-size: 4;
                tab-size: 4;
              }

              #main-container {
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
              }

              /**************/
              /* Typography */
              /**************/
              h1,
              h2 {
                text-align: center;
              }

              h1,
              h2,
              h3 {
                font-weight: bold;
                margin-top: 0.25rem;
                margin-bottom: 0.5rem;
              }

              h1 {
                font-size: 2rem;
              }

              h2 {
                font-size: 1.5rem;
              }

              h3 {
                font-size: 1rem;
              }

              h4 {
                font-size: 0.75rem;
              }

              a {
                text-decoration: underline !important;
              }

              /**************/
              /* Elements   */
              /**************/

              label {
                margin: 0.5rem 0 0 3px;
                font-size: 1rem;
              }

              input,
              select {
                border-radius: 3px;
                border: solid 1px darkgray;
                padding: 0.25rem;
                font-size: 1rem;
              }

              select {
                background: white;
              }

              button:focus {
                outline: 0;
              }

              input[type="radio"],
              input[type="checkbox"] {
                margin-right: 0.5rem;
              }

              input[type="range"] {
                -webkit-appearance: none;
                -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
                height: 8px;
                border: none;
                border-radius: 30px;
                background-image: linear-gradient(to right, #0080ff 5%, #001b3b 100%);
                outline: none;
              }

              /******************/
              /* Style Classes  */
              /******************/

              .disabled-group {
                opacity: 0.4;
                pointer-events: none;
              }

              /****************************/
              /* Project Creation Spinner */
              /****************************/
              #spinner {
                position: absolute;
                left: calc(50% - 2rem);
                width: 4rem;
                height: 4rem;
                border-radius: 2rem;
                border-bottom: 0.5rem solid #3fabc6;
                animation: sweep 1s infinite linear;
                -o-animation: sweep 1s infinite linear;
                -moz-animation: sweep 1s infinite linear;
                -webkit-animation: sweep 1s infinite linear;
              }

              @keyframes sweep {
                to {
                  transform: rotate(360deg);
                }
              }

              @-o-keyframes sweep {
                to {
                  -o-transform: rotate(360deg);
                }
              }

              @-moz-keyframes sweep {
                to {
                  -moz-transform: rotate(360deg);
                }
              }

              @-webkit-keyframes sweep {
                to {
                  -webkit-transform: rotate(360deg);
                }
              }

              /*****************/
              /* Flash Message */
              /*****************/
              .alert {
                position: absolute;
                top: 2.5rem;
                left: 3.5rem;
                width: 35rem;
                border: 1px solid #009;
                padding: 1rem;
                z-index: 1000;
                font-size: 1rem;
                font-style: italic;
                background: white;
                opacity: 0;
                animation: fade-out 6s;
                -webkit-animation: fade-out 6s;
                -moz-animation: fade-out 6s;
                -o-animation: fade-out 6s;
              }

              @-webkit-keyframes fade-out {
                0% {
                  opacity: 0;
                }

                50% {
                  opacity: 1;
                }

                100% {
                  opacity: 0;
                }
              }

              @-moz-keyframes fade-out {
                0% {
                  opacity: 0;
                }

                50% {
                  opacity: 1;
                }

                100% {
                  opacity: 0;
                }
              }

              @-o-keyframes fade-out {
                0% {
                  opacity: 0;
                }

                50% {
                  opacity: 1;
                }

                100% {
                  opacity: 0;
                }
              }

              @keyframes fade-out {
                0% {
                  opacity: 0;
                }

                50% {
                  opacity: 1;
                }

                100% {
                  opacity: 0;
                }
              }
            `}</style>
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
