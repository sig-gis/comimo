import React from "react";
import ReactDOM from "react-dom";
import EmailValidator from "email-validator";

import { ThemeProvider } from "@emotion/react";
import LoadingModal from "./components/LoadingModal";
import LanguageSelector from "./components/LanguageSelector";
import Button from "./components/Button";
import AccountForm from "./components/AccountForm";
import Select from "./components/Select";
import TextInput from "./components/TextInput";

import { getLanguage, jsonRequest, validatePassword } from "./utils";
import { THEME } from "./constants";

class Register extends React.Component {
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
      defaultLang: getLanguage(["en", "es"]),
      showModal: false,
    };
  }

  componentDidMount() {
    this.getLocalText(this.state.defaultLang);
  }

  /// State Update ///

  processModal = (callBack) =>
    new Promise(() =>
      Promise.resolve(
        this.setState({ showModal: true }, () =>
          callBack().finally(() => this.setState({ showModal: false }))
        )
      )
    );

  selectLanguage = (newLang) => {
    this.setState({ defaultLang: newLang });
    this.getLocalText(newLang);
  };

  /// API Calls ///

  getLocalText = (lang) => {
    jsonRequest(`/locale/${lang}.json`, null, "GET")
      .then((data) => this.setState({ localeText: data.users }))
      .catch((err) => console.error(err));
  };

  verifyInputs = () => {
    const { username, email, fullName, institution, password, passwordConfirmation, localeText } =
      this.state;
    return [
      username.length < 3 && localeText.errorUsernameLen,
      !EmailValidator.validate(email) && localeText.errorInvalidEmail,
      fullName.length === 0 && localeText.errorNameReq,
      institution.length === 0 && localeText.errorInstitutionReq,
      !validatePassword(password) && localeText.errorPassword,
      password !== passwordConfirmation && localeText.errorPassMatch,
    ].filter((e) => e);
  };

  registerUser = () => {
    const errors = this.verifyInputs();
    if (errors.length > 0) {
      alert(errors.map((e) => " - " + e).join("\n"));
    } else {
      this.processModal(() =>
        jsonRequest("/register", {
          defaultLang: this.state.defaultLang,
          email: this.state.email,
          fullName: this.state.fullName,
          institution: this.state.institution,
          sector: this.state.sector,
          password: this.state.password,
          username: this.state.username,
        })
          .then((resp) => {
            if (resp === "") {
              alert(this.state.localeText.registered);
              window.location = "/";
            } else {
              console.error(resp);
              alert(this.state.localeText[resp] || this.state.localeText.errorCreating);
            }
          })
          .catch((err) => console.error(err))
      );
    }
  };

  /// Render Functions ///

  renderField = (label, type, stateKey) => (
    <TextInput
      id={stateKey}
      label={label}
      onChange={(e) => this.setState({ [stateKey]: e.target.value })}
      onKeyPress={(e) => {
        if (e.key === "Enter") this.registerUser();
      }}
      placeholder={`Enter ${(label || "").toLowerCase()}`}
      type={type}
      value={this.state[stateKey]}
    />
  );

  renderSelect = (label, options, stateKey) => (
    <Select
      id={stateKey}
      label={label}
      onChange={(e) => this.setState({ [stateKey]: e.target.value })}
      options={options}
      value={this.state[stateKey]}
    />
  );

  render() {
    const { localeText, defaultLang } = this.state;
    return (
      <ThemeProvider theme={THEME}>
        {this.state.showModal && <LoadingModal message={localeText.modalMessage} />}
        <AccountForm header={localeText.registerTitle} submitFn={this.registerUser}>
          <div style={{ display: "flex" }}>
            <label style={{ marginRight: "1rem" }}>{localeText.language}</label>
            <LanguageSelector selectedLanguage={defaultLang} selectLanguage={this.selectLanguage} />
          </div>
          {this.renderField(localeText.username, "text", "username")}
          {this.renderField(localeText.email, "email", "email")}
          {this.renderField(localeText.fullName, "text", "fullName")}
          {this.renderField(localeText.institution, "text", "institution")}
          {this.renderSelect(
            localeText.sector,
            [
              { value: "academic", label: localeText.academic },
              { value: "government", label: localeText.government },
              { value: "ngo", label: localeText.ngo },
            ],
            "sector"
          )}
          {this.renderField(localeText.password, "password", "password")}
          {this.renderField(localeText.confirm, "password", "passwordConfirmation")}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "red" }}>{localeText.allRequired}</span>
            <Button buttonText={localeText.register} extraStyle={{ marginTop: "0.5rem" }} />
          </div>
        </AccountForm>
      </ThemeProvider>
    );
  }
}

export function pageInit(args) {
  ReactDOM.render(<Register />, document.getElementById("main-container"));
}
