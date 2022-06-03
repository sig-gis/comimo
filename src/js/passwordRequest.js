import React from "react";
import ReactDOM from "react-dom";

import {ThemeProvider} from "styled-components";
import LoadingModal from "./components/LoadingModal";
import Button from "./components/Button";
import AccountForm from "./components/AccountForm";

import {getLanguage, jsonRequest} from "./utils";
import {THEME} from "./constants";

class PasswordForgot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      localeText: {},
      showModal: null
    };
  }

  componentDidMount() {
    jsonRequest(`/locale/${getLanguage(["en", "es"])}.json`, null, "GET")
      .then(data => this.setState({localeText: data.users}))
      .catch(error => console.error(error));
  }

  processModal = callBack => new Promise(() => Promise.resolve(
    this.setState(
      {showModal: true},
      () => callBack().finally(() => this.setState({showModal: false}))
    )
  ));

  requestPassword = () => this.processModal(() =>
    jsonRequest("/password-request", {email: this.state.email})
      .then(data => {
        if (data === "") {
          alert(this.state.localeText.tokenSent);
          window.location = "/";
        } else {
          console.error(data);
          alert(this.state.localeText[data] || this.state.localeText.errorCreating);
        }
      })
      .catch(err => console.error(err)));

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
      <ThemeProvider theme={THEME}>
        {this.state.showModal && <LoadingModal message={localeText.modalMessage}/>}
        <AccountForm
          header={localeText.requestTitle}
          submitFn={this.requestPassword}
        >
          {this.renderField(localeText.email, "email", "email")}
          <div className="d-flex justify-content-end">
            <Button
              className="mt-3"
              type="submit"
            >
              {localeText.request}
            </Button>
          </div>
        </AccountForm>
      </ThemeProvider>
    );
  }
}

export function pageInit(args) {
  ReactDOM.render(<PasswordForgot/>, document.getElementById("main-container"));
}
