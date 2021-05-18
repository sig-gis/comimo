import React from "react";
import ReactDOM from "react-dom";

import {getCookie, getLanguage} from "./utils";

class PasswordReset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localeText: {}
    };
  }

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    Promise.all([
      this.getLocale(),
      this.verifyUser(urlParams.get("email") || "", urlParams.get("token") || "")
    ])
      .then(data => {
        if (data[0] && data[1] === "") {
          console.log(this.state.localeText);
          alert(this.state.localeText.verified);
          window.location = "/login";
        } else {
          console.log(data[1]);
          alert(this.state.localeText[data[1]] || this.state.localeText.errorCreating));
          window.location = "/password-forgot";
        }
      })
      .catch(error => console.log(error));
  }

  getLocale = () => fetch(
    `/static/locale/${getLanguage(["en", "es"])}.json`,
    {headers: {"Cache-Control": "no-cache", "Pragma": "no-cache", "Accept": "application/json"}}
  )
    .then(response => (response.ok ? response.json() : Promise.reject(response)))
    .then(data => {
      this.setState({localeText: data.users});
      return true;
    });

  verifyUser = (email, token) => fetch(
    "/verify-user/",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken")
      },
      body: JSON.stringify({
        token,
        email
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
  ReactDOM.render(<PasswordReset/>, document.getElementById("main-container"));
}
