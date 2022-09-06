import React from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";

import { PageLayout, MainContext } from "./components/PageLayout";
import AccountForm from "./components/AccountForm";
import Button from "./components/Button";
import TextInput from "./components/TextInput";

import { getLanguage, jsonRequest } from "./utils";
import { THEME } from "./constants";

const PageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

// TODO should redirect to home page if already logged in!
class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
  }

  requestLogin = () => {
    const { username, password } = this.state;
    jsonRequest("/login", { username, password })
      .then((data) => {
        if (data === "") {
          window.location = "/";
        } else {
          console.error(data);
          const {
            localeText: { users },
          } = this.context;
          alert(t("users.errorCreating"));
        }
      })
      .catch((err) => console.error(err));
  };

  renderField = (label, type, stateKey) => (
    <TextInput
      id={stateKey}
      label={label}
      onChange={(e) => this.setState({ [stateKey]: e.target.value })}
      placeholder={`Enter ${(label || "").toLowerCase()}`}
      type={type}
      value={this.state[stateKey]}
    />
  );

  render() {
    const {
      localeText: { users },
    } = this.context;
    return (
      <ThemeProvider theme={THEME}>
        <PageContainer>
          <AccountForm header={t("users.loginTitle")} submitFn={this.requestLogin}>
            {this.renderField(t("users.username"), "text", "username")}
            {this.renderField(t("users.password"), "password", "password")}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="/password-request">{t("users.forgot")}</a>
              <Button extraStyle={{ marginTop: "1rem" }}>{t("users.login")}</Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3>{t("users.newUser")}</h3>
              <div>
                <div>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      window.location = "/register";
                    }}
                  >
                    {t("users.register")}
                  </Button>
                </div>
              </div>
            </div>
          </AccountForm>
        </PageContainer>
      </ThemeProvider>
    );
  }
}

Login.contextType = MainContext;

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
      version={args.versionDeployed}
      showSearch={false}
    >
      <Login />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
