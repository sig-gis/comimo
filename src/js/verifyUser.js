import React from "react";
import ReactDOM from "react-dom";
import {ThemeProvider} from "styled-components";

import {getLanguage, jsonRequest} from "./utils";
import {THEME} from "./constants";

class PasswordReset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localeText: {}
    };
  }

  componentDidMount() {
    Promise.all([
      this.getLocale(),
      this.verifyEmail()
    ])
      .then(data => {
        if (data[0] && data[1] === "") {
          alert(this.state.localeText.verified);
          window.location = "/login";
        } else {
          console.error(data[1]);
          alert(this.state.localeText[data[1]] || this.state.localeText.errorCreating);
          window.location = "/password-forgot";
        }
      })
      .catch(error => console.error(error));
  }

  getLocale = () => fetch(`/locale/${getLanguage(["en", "es"])}.json`, null, "GET")
    .then(data => {
      this.setState({localeText: data.users});
      return true;
    });

  verifyEmail = () => jsonRequest(
    "/verify-email/",
    {
      passwordResetKey: this.props.passwordResetKey,
      email: this.props.email
    }
  );

  render() {
    const {localeText} = this.state;
    return (
      <ThemeProvider theme={THEME}>
        <div
          className="d-flex justify-content-center"
          style={{paddingTop: "20vh"}}
        >
          <div className="card">
            <div className="card-header">{localeText.verifyUser}</div>
            <div className="card-body">
              <label>{localeText.verifying}...</label>
            </div>
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

export function pageInit(args) {
  ReactDOM.render(
    <PasswordReset
      email={args.email || ""}
      passwordResetKey={args.passwordResetKey || ""}
    />,
    document.getElementById("main-container")
  );
}
