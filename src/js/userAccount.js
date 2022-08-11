import React from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";

import { PageLayout, MainContext } from "./components/PageLayout";
import AccountForm from "./components/AccountForm";
import Button from "./components/Button";
import LanguageSelector from "./components/LanguageSelector";
import LoadingModal from "./components/LoadingModal";
import Select from "./components/Select";
import TextInput from "./components/TextInput";

import { jsonRequest } from "./utils";
import { THEME } from "./constants";

const PageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;
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
      defaultLang: "",
      showModal: false,
    };
  }

  componentDidMount() {
    this.getUserInformation();
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
  };

  /// API Calls ///

  verifyInputs = () => {
    const { fullName, institution } = this.state;
    const {
      localeText: { users },
    } = this.context;

    return [
      fullName.length === 0 && users.errorNameReq,
      institution.length === 0 && users.errorInstitutionReq,
    ].filter((e) => e);
  };

  getUserInformation = () => {
    const {
      localeText: { users },
    } = this.context;
    this.processModal(() =>
      jsonRequest("/user-information")
        .then((data) => {
          if (data.username) {
            this.setState({ ...data });
          } else {
            console.error("userNotFound");
            alert(users?.userNotFound);
          }
        })
        .catch((err) => console.error(err))
    );
  };

  updateUser = () => {
    const errors = this.verifyInputs();
    const {
      localeText: { users },
    } = this.context;
    if (errors.length > 0) {
      alert(errors.map((e) => " - " + e).join("\n"));
    } else {
      this.processModal(() =>
        jsonRequest("/update-account", {
          defaultLang: this.state.defaultLang,
          fullName: this.state.fullName,
          institution: this.state.institution,
          sector: this.state.sector,
        })
          .then((resp) => {
            if (resp === "") {
              alert(users.updated);
              window.location = "/";
            } else {
              console.error(resp);
              alert(users.errorUpdating);
            }
          })
          .catch((err) => console.error(err))
      );
    }
  };

  /// Render Functions ///

  renderField = (label, type, stateKey, disabled = false) => (
    <TextInput
      disabled={disabled}
      id={stateKey}
      label={label}
      onChange={(e) => this.setState({ [stateKey]: e.target.value })}
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
    const { defaultLang } = this.state;
    const {
      localeText: { users },
    } = this.context;
    return (
      <ThemeProvider theme={THEME}>
        <PageContainer>
          {this.state.showModal && <LoadingModal message={users?.modalMessage} />}
          <AccountForm header={users?.userAccountTitle} submitFn={this.updateUser}>
            <div className="d-flex">
              <label className="mr-3">{users?.language}</label>
              <LanguageSelector
                selectedLanguage={defaultLang}
                selectLanguage={this.selectLanguage}
              />
            </div>
            {this.renderField(users?.username, "text", "username", true)}
            {this.renderField(users?.email, "email", "email", true)}
            {this.renderField(users?.fullName, "text", "fullName")}
            {this.renderField(users?.institution, "text", "institution")}
            {this.renderSelect(
              users?.sector,
              [
                { value: "academic", label: users?.academic },
                { value: "government", label: users?.government },
                { value: "ngo", label: users?.ngo },
              ],
              "sector"
            )}
            <div className="d-flex justify-content-between align-items-center">
              <span style={{ color: "red" }}>{users?.allRequired}</span>
              <div className="mt-2 d-flex">
                <Button className="mr-2" onClick={() => window.location.assign("/logout")}>
                  {users?.logout}
                </Button>
                <Button type="submit">{users?.save}</Button>
              </div>
            </div>
          </AccountForm>
        </PageContainer>
      </ThemeProvider>
    );
  }
}

UserAccount.contextType = MainContext;

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
      version={args.version}
    >
      <UserAccount />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
