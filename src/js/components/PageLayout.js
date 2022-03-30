import React from "react";
import AppInfo from "../home/AppInfo";
import {MainContext} from "../home/constants";
import {getLanguage, jsonRequest} from "../utils";
import Header from "./Header";

export default class PageLayout extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      localeText: {},
      selectedLanguage: ["en", "es"].includes(this.props.userLang)
        ? this.props.userLang
        : getLanguage(["en", "es"]),
      myHeight: 0,
      showInfo: false
    };
  }

  componentDidMount() {
    this.getLocalText(this.state.selectedLanguage);
    this.updateWindow();
    window.addEventListener("touchend", this.updateWindow);
    window.addEventListener("resize", this.updateWindow);
  }

  /// State Update ///

  selectLanguage = newLang => {
    this.setState({selectedLanguage: newLang});
    this.getLocalText(newLang);
  };

  updateWindow = () => {
    window.scrollTo(0, 0);
    this.setState({myHeight: window.innerHeight});
  };

  setShowInfo = showInfo => this.setState({showInfo});

  /// API Calls ///

  getLocalText = lang => jsonRequest(`/locale/${lang}.json`, {}, "GET")
    .then(data => this.setState({localeText: data}));

  render() {
    const {myHeight, showInfo} = this.state;
    return (
      <MainContext.Provider
        value={{
          isAdmin: this.props.role === "admin",
          username: this.props.username,
          localeText: this.state.localeText,
          myHeight,
          setShowInfo: this.setShowInfo
        }}
      >
        {showInfo && <AppInfo onClose={() => this.setShowInfo(false)}/>}
        <div
          id="root-component"
          style={{
            height: myHeight,
            width: "100%",
            margin: 0,
            padding: 0,
            position: "relative",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Header
            selectedLanguage={this.state.selectedLanguage}
            selectLanguage={this.selectLanguage}
          />
          <div
            id="page-body"
            style={{
              margin: "0px",
              padding: "0px",
              position: "relative",
              flex: "1"
            }}
          />
          {this.props.children}
        </div>
      </MainContext.Provider>
    );
  }
}
