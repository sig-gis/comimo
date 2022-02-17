import React from "react";
import ReactDOM from "react-dom";

import {getLanguage} from "./utils";

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
      this.verifyUser()
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

  getLocale = () => fetch(
    `/locale/${getLanguage(["en", "es"])}.json`,
    {headers: {"Cache-Control": "no-cache", "Pragma": "no-cache", "Accept": "application/json"}}
  )
    .then(response => (response.ok ? response.json() : Promise.reject(response)))
    .then(data => {
      this.setState({localeText: data.users});
      return true;
    });

  verifyUser = () => fetch(
    "/verify-user/",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        passwordResetKey: this.props.passwordResetKey,
        email: this.props.email
      })
    }
  )
    .then(response => (response.ok ? response.text() : Promise.reject(response)));

  render() {
    const {localeText} = this.state;
    return (
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
