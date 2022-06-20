import React from "react";
import ReactDOM from "react-dom";
import {ThemeProvider} from "@emotion/react";

import Button from "./components/Button";
import AccountForm from "./components/AccountForm";
import TextInput from "./components/TextInput";

import {getLanguage, jsonRequest, validatePassword} from "./utils";
import {THEME} from "./constants";

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
    jsonRequest(`/locale/${getLanguage(["en", "es"])}.json`, null, "GET")
      .then(data => this.setState({localeText: data.users}))
      .catch(error => console.error(error));
  }

  verifyInputs = () => {
    const {password, passwordConfirmation, localeText} = this.state;
    const {email} = this.props;
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
      const {password} = this.state;
      const {email, token} = this.props;
      jsonRequest("/password-reset", {email, token, password})
        .then(resp => {
          if (resp === "") {
            window.location = "/login";
          } else {
            console.error(resp);
            alert(this.state.localeText[resp] || this.state.localeText.errorCreating);
          }
        })
        .catch(err => console.error(err));
    }
  };

  renderField = (label, type, stateKey, fromProps = false) => (
    <TextInput
      disabled={fromProps}
      id={stateKey}
      label={label}
      onChange={e => this.setState({[stateKey]: e.target.value})}
      onKeyPress={e => {
        if (e.key === "Enter") this.resetPassword();
      }}
      placeholder={`Enter ${(label || "").toLowerCase()}`}
      type={type}
      value={fromProps ? this.props[stateKey] : this.state[stateKey]}
    />
  );

  render() {
    const {localeText} = this.state;
    return (
      <ThemeProvider theme={THEME}>
        <AccountForm
          header={localeText.resetTitle}
          submitFn={this.resetPassword}
        >
          {this.renderField(localeText.email, "email", "email", true)}
          {this.renderField(localeText.password, "password", "password")}
          {this.renderField(localeText.confirm, "password", "passwordConfirmation")}
          <div className="d-flex justify-content-end">
            <Button
              className="mt-3"
              type="submit"
            >
              {localeText.resetTitle}
            </Button>
          </div>
        </AccountForm>
      </ThemeProvider>
    );
  }
}

export function pageInit(args) {
  ReactDOM.render(
    <PasswordReset
      email={args.email || ""}
      token={args.token || ""}
    />,
    document.getElementById("main-container")
  );
}
