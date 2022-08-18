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
          alert(users?.errorCreating);
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
          <AccountForm header={users?.loginTitle} submitFn={this.requestLogin}>
            {this.renderField(users?.username, "text", "username")}
            {this.renderField(users?.password, "password", "password")}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="/password-request">{users?.forgot}</a>
              <Button buttonText={users?.login} extraStyle={{ marginTop: "1rem" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h3>{users?.newUser}</h3>
              <div>
                <div>
                  <Button
                    buttonText={users?.register}
                    clickHandler={(e) => {
                      e.preventDefault();
                      window.location = "/register";
                    }}
                  />
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
      version={args.version}
    >
      <Login />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
