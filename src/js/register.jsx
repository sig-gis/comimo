import React, { useState, Suspense } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/react";
import { useAtom } from "jotai";
import EmailValidator from "email-validator";
import { useTranslation } from "react-i18next";

import { ThemeProvider } from "@emotion/react";
import LoadingModal from "./components/LoadingModal";
import LanguageButtons from "./components/LanguageButtons";
import Button from "./components/Button";
import AccountForm from "./components/AccountForm";
import Modal from "./components/Modal";
import Select from "./components/Select";
import TextInput from "./components/TextInput";
import { PageLayout } from "./components/PageLayout";
import Divider from "./components/Divider";

import { showModalAtom, processModal } from "./home";

import { getLanguage, jsonRequest, validatePassword } from "./utils";
import { THEME } from "./constants";

const Label = styled.label`
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium)
    var(--unnamed-font-size-16) / var(--unnamed-line-spacing-19) var(--unnamed-font-family-roboto);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--black);
  margin-right: 1rem;
  margin-bottom: 10px;
  text-align: left;
`;

const PageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: 0 2rem 2rem 2rem;
  width: 100%;
`;

function Register() {
  // State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [sector, setSector] = useState("academic");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [defaultLang, setDefaultLang] = useState(getLanguage(["en", "es"]));
  const [messageBox, setMessageBox] = useState(null);

  const [showModal, setShowModal] = useAtom(showModalAtom);
  const { t } = useTranslation();

  const showAlert = (messageBox) => setMessageBox(messageBox);

  // API calls
  const verifyInputs = () => {
    return [
      username.length < 3 && t("users.errorUsernameLen"),
      !EmailValidator.validate(email) && t("users.errorInvalidEmail"),
      fullName.length === 0 && t("users.errorNameReq"),
      institution.length === 0 && t("users.errorInstitutionReq"),
      !validatePassword(password) && t("users.errorPassword"),
      password !== passwordConfirmation && t("users.errorPassMatch"),
    ].filter((e) => e);
  };

  const registerUser = () => {
    const errors = verifyInputs();
    if (errors.length > 0) {
      console.error(errors.map((e) => " - " + e).join("\n"));
      showAlert({
        body: errors.map((e) => " - " + e).join("\n"),
        closeText: t("users.close"),
        title: t("users.errorRegister"),
      });
    } else {
      processModal(async () => {
        const data = await jsonRequest("/register", {
          defaultLang: defaultLang,
          email: email,
          fullName: fullName,
          institution: institution,
          sector: sector,
          password: password,
          username: username,
        });
        if (data === "") {
          showAlert({
            body: t("users.registered"),
            closeText: t("users.close"),
            title: t("users.successRegister"),
            confirmText: t("users.okText"),
            onConfirm: () => window.location.assign("/"),
          });
        } else {
          console.error(t(`users.${data}`));
          showAlert({
            body: t(`users.${data}` || t("users.errorCreating")),
            closeText: t("users.close"),
            title: t("users.errorRegister"),
          });
        }
      }, setShowModal);
    }
  };

  // Render functions
  const renderField = (label, type, id, state, stateSetter) => (
    <TextInput
      id={`text-input-${id}`}
      label={label}
      onChange={(e) => stateSetter(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === "Enter") registerUser();
      }}
      placeholder={`Enter ${(label || "").toLowerCase()}`}
      type={type}
      value={state}
    />
  );

  const renderSelect = (label, options, id, state, stateSetter) => (
    <Select
      id={`select-input-${id}`}
      label={label}
      onChange={(e) => stateSetter(e.target.value)}
      options={options}
      value={state}
    />
  );

  // Render
  return (
    <ThemeProvider theme={THEME}>
      <PageContainer>
        {showModal && <LoadingModal message={t("users.modalMessage")} />}
        <AccountForm
          header={t("users.registerTitle")}
          submitFn={() => {
            showAlert({
              body: t("users.confirmRegister"),
              closeText: t("users.cancel"),
              confirmText: t("users.confirmText"),
              onConfirm: () => registerUser(),
              title: t("users.register"),
            });
          }}
        >
          <div
            css={css`
              display: flex;
              flex-direction: column;
              margin-bottom: 10px;
            `}
          >
            <Label>{t("users.language")}</Label>
            <LanguageButtons selectedLanguage={defaultLang} selectLanguage={setDefaultLang} />
          </div>
          <Divider />
          {renderField(t("users.username"), "text", "username", username, setUsername)}
          {renderField(t("users.email"), "email", "email", email, setEmail)}
          {renderField(t("users.fullName"), "text", "fullName", fullName, setFullName)}
          {renderField(t("users.institution"), "text", "institution", institution, setInstitution)}
          {renderSelect(
            t("users.sector"),
            [
              { value: "academic", label: t("users.academic") },
              { value: "government", label: t("users.government") },
              { value: "ngo", label: t("users.ngo") },
            ],
            "sector",
            sector,
            setSector
          )}
          {renderField(t("users.password"), "password", "password", password, setPassword)}
          {renderField(
            t("users.confirm"),
            "password",
            "passwordConfirmation",
            passwordConfirmation,
            setPasswordConfirmation
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "red" }}>{t("users.allRequired")}</span>
            <Button extraStyle={{ marginTop: "0.5rem" }}>{t("users.register")}</Button>
          </div>
        </AccountForm>
        {messageBox && (
          <Modal {...messageBox} onClose={() => setMessageBox(null)}>
            {messageBox.body.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Modal>
        )}
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
        version={args.versionDeployed}
        showSearch={false}
      >
        <Register />
      </PageLayout>
    </Suspense>,
    document.getElementById("main-container")
  );
}
