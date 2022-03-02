import React from "react";
import ReactDOM from "react-dom";

import LoadingModal from "./components/LoadingModal";

import {getLanguage, jsonRequest} from "./utils";

class PasswordForgot extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      localeText: {},
      showModal: false
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
    jsonRequest("/password-request/", {email: this.state.email})
      .then(data => {
        if (data[0] && data[1] === "") {
          alert(this.state.localeText.tokenSent);
          window.location = "/";
        } else {
          console.error(data[1]);
          alert(this.state.localeText[data[1]] || this.state.localeText.errorCreating);
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
        onKeyPress={e => {
          if (e.key === "Enter") this.requestPassword();
        }}
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
        {this.state.showModal && <LoadingModal message={localeText.modalMessage}/>}
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
