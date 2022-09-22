import React, { useState, Suspense } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";

import { ThemeProvider } from "@emotion/react";
import LoadingModal from "./components/LoadingModal";
import Button from "./components/Button";
import AccountForm from "./components/AccountForm";
import TextInput from "./components/TextInput";
import { PageLayout } from "./components/PageLayout";
import Modal from "./components/Modal";

import { showModalAtom, processModal } from "./home";

import { jsonRequest } from "./utils";
import { THEME } from "./constants";

const PageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  padding: 2rem;
  width: 100%;
`;

function PasswordForgot() {
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const [messageBox, setMessageBox] = useState(null);

  const { t } = useTranslation();

  const showAlert = (messageBox) => setMessageBox(messageBox);

  const requestPassword = () =>
    processModal(async () => {
      const data = await jsonRequest("/password-request", { email: email }).catch(console.error);
      if (data === "") {
        showAlert({
          body: t("users.tokenSent"),
          closeText: t("users.close"),
          title: t("users.tokenSentTitle"),
          confirmText: t("users.okText"),
          onConfirm: () => window.location.assign("/"),
        });
      } else {
        console.error(t(`users.${data}`));
        showAlert({
          body: t(`users.${data}`) || t("users.tokenSentError"),
          closeText: t("users.close"),
          title: t("users.tokenSentErrorTitle"),
        });
      }
    }, setShowModal);

  return (
    <ThemeProvider theme={THEME}>
      <PageContainer>
        {showModal && <LoadingModal message={t("users.modalMessage")} />}
        <AccountForm header={t("users.requestTitle")} submitFn={requestPassword}>
          <TextInput
            id="email-input-password-request"
            label="Email"
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") requestPassword();
            }}
            placeholder={t("users.enterEmail")}
            type="email"
            value={email}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button>{t("users.request")}</Button>
          </div>
        </AccountForm>
        {messageBox && (
          <Modal {...messageBox} onClose={() => setMessageBox(null)}>
            <p>{messageBox.body}</p>
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
        <PasswordForgot />
      </PageLayout>
    </Suspense>,
    document.getElementById("main-container")
  );
}
