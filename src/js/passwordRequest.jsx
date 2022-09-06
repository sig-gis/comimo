import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { useAtom, useAtomValue } from "jotai";

import { ThemeProvider } from "@emotion/react";
import LoadingModal from "./components/LoadingModal";
import Button from "./components/Button";
import AccountForm from "./components/AccountForm";
import TextInput from "./components/TextInput";
import { PageLayout, localeTextAtom } from "./components/PageLayout";

import { showModalAtom, processModal } from "./home";

import { jsonRequest } from "./utils";
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

function PasswordForgot() {
  const [email, setEmail] = useState("");

  const localeText = useAtomValue(localeTextAtom);
  const [showModal, setShowModal] = useAtom(showModalAtom);

  const requestPassword = () =>
    processModal(async () => {
      const data = await jsonRequest("/password-request", { email: email }).catch(console.error);
      if (data === "") {
        alert(localeText.users?.tokenSent);
        window.location = "/";
      } else {
        console.error(localeText.users?.[data]);
        alert(localeText.users?.[data] || localeText.users?.errorCreating);
      }
    }, setShowModal);

  const renderEmailField = (label) => (
    <TextInput
      id="email-input-password-request"
      label={label}
      onChange={(e) => setEmail(e.target.value)}
      onKeyPress={(e) => {
        if (e.key === "Enter") requestPassword();
      }}
      placeholder={localeText.users?.enterEmail}
      type="email"
      value={email}
    />
  );

  return (
    <ThemeProvider theme={THEME}>
      <PageContainer>
        {showModal && <LoadingModal message={localeText.users?.modalMessage} />}
        <AccountForm header={localeText.users?.requestTitle} submitFn={requestPassword}>
          {renderEmailField(localeText.users?.email)}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button>{localeText.users?.request}</Button>
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
      <PasswordForgot />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
