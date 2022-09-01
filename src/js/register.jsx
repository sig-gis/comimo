import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { useAtom, useAtomValue } from "jotai";
import EmailValidator from "email-validator";

import { ThemeProvider } from "@emotion/react";
import LoadingModal from "./components/LoadingModal";
import LanguageSelector from "./components/LanguageSelector";
import Button from "./components/Button";
import AccountForm from "./components/AccountForm";
import Select from "./components/Select";
import TextInput from "./components/TextInput";
import { PageLayout, localeTextAtom } from "./components/PageLayout";

import { showModalAtom, processModal } from "./home";

import { getLanguage, jsonRequest, validatePassword } from "./utils";
import { THEME } from "./constants";

const PageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  padding: 2rem;
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

  const [showModal, setShowModal] = useAtom(showModalAtom);
  const localeText = useAtomValue(localeTextAtom);

  // API calls
  const verifyInputs = () => {
    return [
      username.length < 3 && localeText.users?.errorUsernameLen,
      !EmailValidator.validate(email) && localeText.users?.errorInvalidEmail,
      fullName.length === 0 && localeText.users?.errorNameReq,
      institution.length === 0 && localeText.users?.errorInstitutionReq,
      !validatePassword(password) && localeText.users?.errorPassword,
      password !== passwordConfirmation && localeText.users?.errorPassMatch,
    ].filter((e) => e);
  };

  const registerUser = () => {
    const errors = verifyInputs();
    if (errors.length > 0) {
      alert(errors.map((e) => " - " + e).join("\n"));
    } else {
      processModal(() => {
        jsonRequest("/register", {
          defaultLang: defaultLang,
          email: email,
          fullName: fullName,
          institution: institution,
          sector: sector,
          password: password,
          username: username,
        })
          .then((resp) => {
            if (resp === "") {
              alert(localeText.users?.registered);
              window.location = "/";
            } else {
              console.error(resp);
              alert(localeText[resp] || localeText.users?.errorCreating);
            }
          })
          .catch((err) => console.error(err));
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
        {showModal && <LoadingModal message={localeText.users?.modalMessage} />}
        <AccountForm header={localeText.users?.registerTitle} submitFn={registerUser}>
          <div style={{ display: "flex" }}>
            <label style={{ marginRight: "1rem" }}>{localeText.users?.language}</label>
            <LanguageSelector selectedLanguage={defaultLang} selectLanguage={setDefaultLang} />
          </div>
          {renderField(localeText.users?.username, "text", "username", username, setUsername)}
          {renderField(localeText.users?.email, "email", "email", email, setEmail)}
          {renderField(localeText.users?.fullName, "text", "fullName", fullName, setFullName)}
          {renderField(
            localeText.users?.institution,
            "text",
            "institution",
            institution,
            setInstitution
          )}
          {renderSelect(
            localeText.users?.sector,
            [
              { value: "academic", label: localeText.users?.academic },
              { value: "government", label: localeText.users?.government },
              { value: "ngo", label: localeText.users?.ngo },
            ],
            "sector",
            sector,
            setSector
          )}
          {renderField(localeText.users?.password, "password", "password", password, setPassword)}
          {renderField(
            localeText.users?.confirm,
            "password",
            "passwordConfirmation",
            passwordConfirmation,
            setPasswordConfirmation
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "red" }}>{localeText.users?.allRequired}</span>
            <Button extraStyle={{ marginTop: "0.5rem" }}>{localeText.users?.register}</Button>
          </div>
        </AccountForm>
      </PageContainer>
    </ThemeProvider>
  );
}

export function pageInit(args) {
  ReactDOM.render(
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
      version={args.versionDeployed}
      showSearch={false}
    >
      <Register />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
