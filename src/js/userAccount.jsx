import React, { useState } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import { ThemeProvider } from "@emotion/react";

import AccountForm from "./components/AccountForm";
import Button from "./components/Button";
import LanguageSelector from "./components/LanguageSelector";
import LoadingModal from "./components/LoadingModal";
import Modal from "./components/Modal";
import Select from "./components/Select";
import TextInput from "./components/TextInput";

import { processModal, showModalAtom } from "./home";

import {
  PageLayout,
  MainContext,
  localeTextAtom,
  selectedLanguageAtom,
  selectLanguage,
} from "./components/PageLayout";
import { jsonRequest } from "./utils";
import { THEME } from "./constants";
import { useEffect } from "react";
import { useAtom } from "jotai";

const PageContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

function UserAccount() {
  const [showModal, setShowModal] = useAtom(showModalAtom);
  const [{ users }, setLocaleText] = useAtom(localeTextAtom);
  const [selectedLanguage, setSelectedLanguage] = useAtom(selectedLanguageAtom);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [institution, setInstitution] = useState("");
  const [sector, setSector] = useState("academic");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [defaultLang, setDefaultLang] = useState("en");
  const [messageBox, setMessageBox] = useState(null);

  useEffect(() => {
    getUserInformation();
  }, []);

  const showAlert = (messageBox) => setMessageBox(messageBox);

  const verifyInputs = () => {
    return [
      fullName.length === 0 && users.errorNameReq,
      institution.length === 0 && users.errorInstitutionReq,
    ].filter((e) => e);
  };

  const getUserInformation = () => {
    processModal(async () => {
      const data = await jsonRequest("/user-information").catch(console.error);
      if (data.username) {
        setDefaultLang(data.defaultLang);
        setUsername(data.username);
        setEmail(data.email);
        setUsername(data.username);
        setFullName(data.fullName);
        setInstitution(data.institution);
        setSector(data.sector);
      } else {
        console.error("userNotFound");
        alert(users?.userNotFound);
      }
    }, setShowModal);
  };

  const updateUser = async () => {
    const errors = verifyInputs();
    if (errors.length > 0) {
      alert(errors.map((e) => " - " + e).join("\n"));
    } else {
      processModal(async () => {
        const resp = await jsonRequest("/update-account", {
          defaultLang,
          fullName,
          institution,
          sector,
        }).catch(console.error);

        if (resp === "") {
          selectLanguage(defaultLang, setSelectedLanguage, setLocaleText);
          showAlert({
            body: users?.successUpdate,
            closeText: users?.close,
            title: users?.updateTitle,
          });
        } else {
          console.error(resp);
          showAlert({
            body: users?.errorUpdating,
            closeText: users?.close,
            title: users?.error,
          });
        }
      }, setShowModal);
    }
  };
  return (
    <ThemeProvider theme={THEME}>
      <PageContainer>
        {showModal && <LoadingModal message={users?.modalMessage} />}
        {/* TODO: Make submitFn optional for AccountForm and TitledForm */}
        <AccountForm header={users?.userAccountTitle} submitFn={() => {}}>
          <div style={{ display: "flex", marginBottom: "0.5rem" }}>
            <label style={{ marginRight: "1rem" }}>{users?.language}</label>
            <LanguageSelector
              selectedLanguage={defaultLang}
              selectLanguage={(newLnag) => setDefaultLang(newLnag)}
            />
          </div>
          <TextInput
            disabled={false}
            id="username"
            label={users?.username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={`Enter ${(users?.username || "").toLowerCase()}`}
            type={"text"}
            value={username}
          />

          <TextInput
            disabled={false}
            id="email"
            label={users?.email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={`Enter ${(users?.email || "").toLowerCase()}`}
            type={"email"}
            value={email}
          />

          <TextInput
            disabled={false}
            id="fullName"
            label={users?.fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={`Enter ${(users?.fullName || "").toLowerCase()}`}
            type={"text"}
            value={fullName}
          />

          <TextInput
            disabled={false}
            id="fullName"
            label={users?.institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder={`Enter ${(users?.institution || "").toLowerCase()}`}
            type={"text"}
            value={fullName}
          />

          <Select
            id="sector"
            label={users?.sector}
            onChange={(e) => setSector(e.target.value)}
            options={[
              { value: "academic", label: users?.academic },
              { value: "government", label: users?.government },
              { value: "ngo", label: users?.ngo },
            ]}
            value={sector}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "red" }}>{users?.allRequired}</span>
            <div style={{ display: "flex", marginTop: "0.5rem" }}>
              <Button
                onClick={() => {
                  showAlert({
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
                  showAlert({
                    body: users?.updateBody,
                    closeText: users?.cancel,
                    confirmText: users?.confirmText,
                    onConfirm: () => updateUser(),
                    title: users?.userAccountTitle,
                  });
                }}
              >
                {users?.save}
              </Button>
            </div>
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
    <PageLayout
      role={args.role}
      userLang={args.userLang}
      username={args.username}
      showSearch={false}
    >
      <UserAccount />
    </PageLayout>,
    document.getElementById("main-container")
  );
}
