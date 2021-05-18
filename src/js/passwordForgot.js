import React from "react";
import ReactDOM from "react-dom";

import {getCookie, getLanguage} from "./utils";

class PasswordForgot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      localeText: {}
    };
  }

  componentDidMount() {
    fetch(
            `/static/locale/${getLanguage(["en", "es"])}.json`,
            {headers: {"Cache-Control": "no-cache", "Pragma": "no-cache", "Accept": "application/json"}}
    )
      .then(response => (response.ok ? response.json() : Promise.reject(response)))
      .then(data => this.setState({localeText: data.users}))
      .catch(error => console.log(error));
  }

    requestPassword = () => {
      fetch("/password-forgot/",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken")
              },
              body: JSON.stringify({
                email: this.state.email
              })
            })
        .then(response => Promise.all([response.ok, response.text()]))
        .then(data => {
          if (data[0] && data[1] === "") {
            alert(this.state.localeText.tokenSent);
            window.location = "/";
          } else {
            console.log(data[1]);
            alert(this.state.localeText[data[1]] || this.state.localeText.errorCreating));
          }
        })
        .catch(err => console.log(err));
    };

    renderField = (label, type, stateKey) => (
      <div className="d-flex flex-column">
        <label htmlFor={stateKey}>{label}</label>
        <input
          className="p-2"
          id={stateKey}
          onChange={e => this.setState({[stateKey]: e.target.value})}
          placeholder={`Enter ${(label || "").toLowerCase()}`}
          type={type}
          value={this.state[stateKey]}
        />
      </div>
    );

    render() {
      const {localeText} = this.state;
      return (
        <div
          className="d-flex justify-content-center"
          style={{paddingTop: "20vh"}}
        >
          <div className="card">
            <div className="card-header">{localeText.requestTitle}</div>
            <div className="card-body">
              {this.renderField(localeText.email, "email", "email")}
              <div className="d-flex justify-content-end">
                <button
                  className="btn orange-btn mt-3"
                  onClick={this.requestPassword}
                  type="button"
                >
                  {localeText.request}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
}

export function pageInit(args) {
  ReactDOM.render(<PasswordForgot/>, document.getElementById("main-container"));
}
