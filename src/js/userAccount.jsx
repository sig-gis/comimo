import React from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";

import { PageLayout, MainContext } from "./components/PageLayout";
import AccountForm from "./components/AccountForm";
import Button from "./components/Button";
import LanguageSelector from "./components/LanguageSelector";
import LoadingModal from "./components/LoadingModal";
import Modal from "./components/Modal";
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
      messageBox: null,
    };
  }

  componentDidMount() {
    this.getUserInformation();
  }

  /// State Update ///

  showAlert = (messageBox) =>
    this.setState({
      messageBox,
    });

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
              this.showAlert({
                body: users?.successUpdate,
                closeText: users?.close,
                title: users?.updateTitle,
              });
            } else {
              console.error(resp);
              this.showAlert({
                body: users?.errorUpdating,
                closeText: users?.close,
                title: users?.error,
              });
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
          {/* TODO: Make submitFn optional for AccountForm and TitledForm */}
          <AccountForm header={users?.userAccountTitle} submitFn={() => {}}>
            <div style={{ display: "flex", marginBottom: "0.5rem" }}>
              <label style={{ marginRight: "1rem" }}>{users?.language}</label>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "red" }}>{users?.allRequired}</span>
              <div style={{ display: "flex", marginTop: "0.5rem" }}>
                <Button
                  onClick={() => {
                    this.showAlert({
                      body: users?.logOutBody,
                      closeText: users?.cancel,
                      confirmText: users?.confirmText,
                      onConfirm: () => window.location.assign("/logout"),
                      title: users?.logout,
                    });
                  }}
                  extraStyle={{ marginRight: "0.5rem" }}
                >
                  {users?.logout}
                </Button>
                <Button
                  onClick={() => {
                    this.showAlert({
                      body: users?.updateBody,
                      closeText: users?.cancel,
                      confirmText: users?.confirmText,
                      onConfirm: () => this.updateUser(),
                      title: users?.userAccountTitle,
                    });
                  }}
                >
                  {users?.save}
                </Button>
              </div>
            </div>
          </AccountForm>
          {this.state.messageBox && (
            <Modal {...this.state.messageBox} onClose={() => this.setState({ messageBox: null })}>
              <p>{this.state.messageBox.body}</p>
            </Modal>
          )}
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
