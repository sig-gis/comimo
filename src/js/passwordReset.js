import React from "react";
import ReactDOM from "react-dom";

import {getLanguage, validatePassword} from "./utils";

class PasswordReset extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: "",
      passwordConfirmation: "",
      localeText: {}
    };
  }

  componentDidMount() {
    fetch(
      `/locale/${getLanguage(["en", "es"])}.json`,
      {headers: {"Cache-Control": "no-cache", "Pragma": "no-cache", "Accept": "application/json"}}
    )
      .then(response => (response.ok ? response.json() : Promise.reject(response)))
      .then(data => this.setState({localeText: data.users}))
      .catch(error => console.error(error));
  }

  verifyInputs = () => {
    const {email, password, passwordConfirmation, localeText} = this.state;
    return [
      email.length === 0 && localeText.errorEmailReq,
      !validatePassword(password) && localeText.errorPassword,
      password !== passwordConfirmation && localeText.errorPassMatch
    ].filter(e => e);
  };

  resetPassword = () => {
    const errors = this.verifyInputs();
    if (errors.length > 0) {
      alert(errors.map(e => " - " + e).join("\n"));
    } else {
      fetch("/password-reset/",
            {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                email: this.props.email,
                password: this.state.password,
                passwordResetKey: this.props.passwordResetKey
              })
            })
        .then(response => Promise.all([response.ok, response.text()]))
        .then(data => {
          if (data[0] && data[1] === "") {
            window.location = "/";
          } else {
            console.error(data[1]);
            alert(this.state.localeText[data[1]] || this.state.localeText.errorCreating);
          }
        })
        .catch(err => console.error(err));
    }
  };

  renderField = (label, type, stateKey, fromProps = false) => (
    <div className="d-flex flex-column">
      <label htmlFor={stateKey}>{label}</label>
      <input
        className="p-2"
        disabled={fromProps}
        id={stateKey}
        onChange={e => this.setState({[stateKey]: e.target.value})}
        onKeyPress={e => {
          if (e.key === "Enter") this.resetPassword();
        }}
        placeholder={`Enter ${(label || "").toLowerCase()}`}
        type={type}
        value={fromProps ? this.props[stateKey] : this.state[stateKey]}
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
            {this.renderField(localeText.email, "email", "email", true)}
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
  ReactDOM.render(
    <PasswordReset
      email={args.email || ""}
      passwordResetKey={args.passwordResetKey || ""}
    />,
    document.getElementById("main-container")
  );
}
