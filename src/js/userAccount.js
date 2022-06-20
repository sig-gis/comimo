import React from "react";
import ReactDOM from "react-dom";
import {ThemeProvider} from "@emotion/react";

import AccountForm from "./components/AccountForm";
import Button from "./components/Button";
import LanguageSelector from "./components/LanguageSelector";
import LoadingModal from "./components/LoadingModal";
import Select from "./components/Select";
import TextInput from "./components/TextInput";

import {jsonRequest} from "./utils";
import {THEME} from "./constants";

class UserAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      email: "",
      fullName: "",
      institution: "",
      sector: "academic",
      password: "",
      passwordConfirmation: "",
      localeText: {},
      defaultLang: "",
      showModal: false
    };
  }

  componentDidMount() {
    this.getUserInformation();
  }

  /// State Update ///

  processModal = callBack => new Promise(() => Promise.resolve(
    this.setState(
      {showModal: true},
      () => callBack().finally(() => this.setState({showModal: false}))
    )
  ));

  selectLanguage = newLang => {
    this.setState({defaultLang: newLang});
    this.getLocalText(newLang);
  };

  /// API Calls ///

  getLocalText = lang => {
    jsonRequest(`/locale/${lang}.json`, null, "GET")
      .then(data => this.setState({localeText: data.users}))
      .catch(err => console.error(err));
  };

  verifyInputs = () => {
    const {fullName, institution, localeText} = this.state;
    return [
      fullName.length === 0 && localeText.errorNameReq,
      institution.length === 0 && localeText.errorInstitutionReq
    ].filter(e => e);
  };

  getUserInformation = () => {
    this.processModal(() =>
      jsonRequest("/user-information")
        .then(data => {
          if (data.username) {
            this.setState({...data});
            this.getLocalText(data.defaultLang);
          } else {
            console.error("userNotFound");
            // FIXME, "userNotFound" is not in the locale
            alert(this.state.localeText.userNotFound || this.state.localeText.errorUpdating);
          }
        })
        .catch(err => console.error(err)));
  };

  updateUser = () => {
    const errors = this.verifyInputs();
    if (errors.length > 0) {
      alert(errors.map(e => " - " + e).join("\n"));
    } else {
      this.processModal(() =>
        jsonRequest(
          "/update-account",
          {
            defaultLang: this.state.defaultLang,
            fullName: this.state.fullName,
            institution: this.state.institution,
            sector: this.state.sector
          }
        )
          .then(resp => {
            if (resp === "") {
              alert(this.state.localeText.updated);
              window.location = "/";
            } else {
              console.error(resp);
              alert(this.state.localeText[resp] || this.state.localeText.errorUpdating);
            }
          })
          .catch(err => console.error(err)));
    }
  };

  /// Render Functions ///

  renderField = (label, type, stateKey, disabled = false) => (
    <TextInput
      disabled={disabled}
      id={stateKey}
      label={label}
      onChange={e => this.setState({[stateKey]: e.target.value})}
      placeholder={`Enter ${(label || "").toLowerCase()}`}
      type={type}
      value={this.state[stateKey]}
    />
  );

  renderSelect = (label, options, stateKey) => (
    <Select
      id={stateKey}
      label={label}
      onChange={e => this.setState({[stateKey]: e.target.value})}
      options={options}
      value={this.state[stateKey]}
    />
  );

  render() {
    const {localeText, defaultLang} = this.state;
    return (
      <ThemeProvider theme={THEME}>
        {this.state.showModal && (<LoadingModal message={localeText.modalMessage}/>)}
        <AccountForm
          header={localeText.userAccountTitle}
          submitFn={this.updateUser}
        >
          <div className="d-flex">
            <label className="mr-3">{localeText.language}</label>
            <LanguageSelector
              selectedLanguage={defaultLang}
              selectLanguage={this.selectLanguage}
            />
          </div>
          {this.renderField(localeText.username, "text", "username", true)}
          {this.renderField(localeText.email, "email", "email", true)}
          {this.renderField(localeText.fullName, "text", "fullName")}
          {this.renderField(localeText.institution, "text", "institution")}
          {this.renderSelect(
            localeText.sector,
            [
              {value: "academic", label: localeText.academic},
              {value: "government", label: localeText.government},
              {value: "ngo", label: localeText.ngo}
            ],
            "sector"
          )}
          <div className="d-flex justify-content-between align-items-center">
            <span style={{color: "red"}}>{localeText.allRequired}</span>
            <div className="mt-2 d-flex">
              <Button
                className="mr-2"
                onClick={() => window.location.assign("/logout")}
              >
                Logout
              </Button>
              <Button
                type="submit"
              >
                {localeText.save}
              </Button>
            </div>
          </div>
        </AccountForm>
      </ThemeProvider>
    );
  }
}

export function pageInit(args) {
  ReactDOM.render(<UserAccount/>, document.getElementById("main-container"));
}
