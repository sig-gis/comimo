import React, { useState, Suspense } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";
import { useTranslation } from "react-i18next";

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
  overflow: auto;
  width: 100%;
`;

// TODO should redirect to home page if already logged in!

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { t, i18n } = useTranslation();

  const requestLogin = async () => {
    const data = await jsonRequest("/login", { username, password }).catch(console.error);
    if (data === "") {
      window.location = "/";
    } else {
      console.error(data);
      alert(t("users.errorCreating"));
    }
  };

  return (
    <ThemeProvider theme={THEME}>
      <PageContainer>
        <AccountForm header={t("users.loginTitle")} submitFn={requestLogin}>
          <TextInput
            id="username"
            label={t("users.username")}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={`Enter ${(t("users.username") || "").toLowerCase()}`}
            type={"text"}
            value={username}
          />

          <TextInput
            id="password"
            label={t("users.username")}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={`Enter ${(t("users.username") || "").toLowerCase()}`}
            type="password"
            value={password}
          />
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

export function pageInit(args) {
  ReactDOM.render(
    <Suspense fallback="">
      <PageLayout
        role={args.role}
        username={args.username}
        versionDeployed={args.versionDeployed}
        showSearch={false}
      >
        <Login />
      </PageLayout>
    </Suspense>,
    document.getElementById("main-container")
  );
}
