import React from "react";
import ReactDOM from "react-dom";

import {getCookie, getLanguage, validatePassword} from "./utils";

class PasswordReset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      token: "",
      password: "",
      passwordConfirmation: "",
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
    const urlParams = new URLSearchParams(window.location.search);
    this.setState({
      email: urlParams.get("email") || "",
      token: urlParams.get("token") || ""
    });
  }

    verifyInputs = () => {
      const {email, password, passwordConfirmation} = this.state;
      return [
        email.length === 0 && "- Please enter your email.",
        !validatePassword(password) && "- Your password must be a minimum eight characters and contain at least one uppercase letter, one lowercase letter, one number and one special character -or- be a minimum of 16 characters.",
        password !== passwordConfirmation && "- Your passwords must match."
      ].filter(e => e);
    };

    resetPassword = () => {
      const errors = this.verifyInputs();
      if (errors.length > 0) {
        alert(errors.join("\n"));
      } else {
        fetch("/password-reset/",
              {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                  "X-CSRFToken": getCookie("csrftoken")
                },
                body: JSON.stringify({
                  email: this.state.email,
                  password: this.state.password,
                  token: this.state.token
                })
              })
          .then(response => Promise.all([response.ok, response.text()]))
          .then(data => {
            if (data[0] && data[1] === "") {
              window.location = "/";
            } else {
              console.log(data[1]);
              alert(this.state.localeText[data[1]] || this.state.localeText.errorCreating);
            }
          })
          .catch(err => console.log(err));
      }
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
            <div className="card-header">{localeText.resetTitle}</div>
            <div className="card-body">
              {this.renderField(localeText.email, "email", "email")}
              {this.renderField(localeText.password, "password", "password")}
              {this.renderField(localeText.confirm, "password", "passwordConfirmation")}
              <div className="d-flex justify-content-end">
                <button
                  className="btn orange-btn mt-3"
                  onClick={this.resetPassword}
                  type="button"
                >
                  {localeText.resetTitle}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
}

export function pageInit(args) {
  ReactDOM.render(<PasswordReset/>, document.getElementById("main-container"));
}
