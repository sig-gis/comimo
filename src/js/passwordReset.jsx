import React, { Suspense, useState } from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "@emotion/react";
import { useTranslation } from "react-i18next";

import Button from "./components/Button";
import AccountForm from "./components/AccountForm";
import TextInput from "./components/TextInput";
import { PageLayout } from "./components/PageLayout";
import { renderMessageBox } from "./components/Modal";

import { jsonRequest, validatePassword } from "./utils";
import { THEME } from "./constants";

function PasswordReset({ email, token }) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [messageBox, setMessageBox] = useState(null);

  const { t } = useTranslation();

  const showAlert = (messageBox) => setMessageBox(messageBox);

  const verifyInputs = () => {
    return [
      email.length === 0 && t("users.errorEmailReq"),
      !validatePassword(password) && t("users.errorPassword"),
      password !== passwordConfirmation && t("users.errorPassMatch"),
    ].filter((e) => e);
  };

  const resetPassword = () => {
    const errors = verifyInputs();
    if (errors.length > 0) {
      console.error(errors.map((e) => " - " + e).join("\n"));
      showAlert({
        body: errors.map((e) => " - " + e).join("\n"),
        closeText: t("users.close"),
        title: t("users.tokenSentErrorTitle"),
      });
    } else {
      jsonRequest("/password-reset", { email, token, password })
        .then((resp) => {
          if (resp === "") {
            window.location = "/login";
          } else {
            console.error(t(`users.${resp}`));
            showAlert({
              body: t(`users.${resp}`) || t("users.errorCreating"),
              closeText: t("users.close"),
              title: t("users.tokenSentErrorTitle"),
            });
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const renderField = (label, type, id, state, stateSetter) => (
    <TextInput
      id={`text-input-${id}`}
      label={label}
      onChange={(e) => stateSetter(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === "Enter") resetPassword();
      }}
      placeholder={`Enter ${(label || "").toLowerCase()}`}
      type={type}
      value={state}
    />
  );

  return (
    <ThemeProvider theme={THEME}>
      <AccountForm header={t("users.resetTitle")} submitFn={resetPassword}>
        <TextInput
          className="disabled-group"
          id="text-input-email"
          disabled={true}
          extraStyle={{ cursor: "not-allowed", pointerEvents: "none" }}
          label={t("users.email")}
          onKeyPress={(e) => {
            if (e.key === "Enter") resetPassword();
          }}
          placeholder="Enter email"
          type="email"
          value={email}
        />
        {renderField(t("users.password"), "password", "password", password, setPassword)}
        {renderField(
          t("users.confirm"),
          "password",
          "passwordConfirmation",
          passwordConfirmation,
          setPasswordConfirmation
        )}
        <div style={{ display: "flex", justifyContent: "end" }}>
          <Button>{t("users.resetTitle")}</Button>
        </div>
      </AccountForm>
      {renderMessageBox(messageBox, () => setMessageBox(null))}
    </ThemeProvider>
  );
}

export function pageInit(args) {
  ReactDOM.render(
    <Suspense fallback="">
      <PageLayout
        role={args.role}
        username={args.username}
        version={args.versionDeployed}
        showSearch={false}
      >
        <PasswordReset email={args.email || ""} token={args.token || ""} />
      </PageLayout>
    </Suspense>,
    document.getElementById("main-container")
  );
}
