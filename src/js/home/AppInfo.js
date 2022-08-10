import React, { useState, useContext } from "react";

import Button from "../components/Button";
import InfoModal from "../components/InfoModal";
import Modal from "../components/Modal";
import { MainContext } from "../components/PageLayout";

export default function AppInfo({ onClose, isAdmin, localeText: { appInfo } }) {
  const { username } = useContext(MainContext);
  const [messageBox, _setMessageBox] = useState(null);

  const showAlert = ({ body, closeText, confirmText, onConfirm, title }) => {
    console.log("showalert");
    const newMessageBoxVal = { body, closeText, confirmText, onConfirm, title };
    console.log("newMessageBoxVal", newMessageBoxVal);
    _setMessageBox({ ...newMessageBoxVal });
  };

  const hideAlert = () => _setMessageBox(null);

  const downloadLink = () => (
    <>
      {isAdmin && (
        <Button
          style={{ marginRight: "1rem" }}
          onClick={() => window.location.assign("/download-data")}
        >
          {appInfo.download}
        </Button>
      )}
      <Button
        onClick={() => {
          showAlert({
            body: "test body",
            closeText: "test close",
            confirmText: "Log out?",
            onConfirm: () => window.location.assign("/logout"),
            title: appInfo.logout,
          });
        }}
      >
        {appInfo.logout}
      </Button>
    </>
  );

  const extLink = (link, text) => (
    <a className="mt-2" href={link} rel="noopener noreferrer" target="_blank">
      {text}
    </a>
  );

  return (
    <InfoModal nextToClose={username && downloadLink()} onClose={onClose}>
      <h2>{appInfo.title}</h2>
      <h3 style={{ margin: "1rem 0" }}>{appInfo.termsOfUse}</h3>
      <p>{appInfo.shortTerms}</p>
      {extLink(appInfo.termsUrl, appInfo.viewTerms)}
      {extLink(appInfo.methodUrl, appInfo.viewMethod)}
      {extLink(appInfo.manualUrl, appInfo.viewManual)}
      {messageBox && (
        <Modal
          {...messageBox}
          onClose={() => {
            hideAlert();
          }}
        >
          <p>{messageBox.body}</p>
        </Modal>
      )}
    </InfoModal>
  );
}
