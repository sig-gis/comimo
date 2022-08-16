import React, { useState, useContext } from "react";

import Button from "../components/Button";
import InfoModal from "../components/InfoModal";
import Modal from "../components/Modal";
import { MainContext } from "../components/PageLayout";

export default function AppInfo({ onClose, isAdmin }) {
  const {
    localeText: { users, appInfo },
    username,
  } = useContext(MainContext);
  const [messageBox, _setMessageBox] = useState(null);

  const showAlert = (newMessageBox) => {
    _setMessageBox({ ...newMessageBox });
  };

  const hideAlert = () => _setMessageBox(null);

  const extLink = (link, text) => (
    <a style={{ marginTop: "0.5rem" }} href={link} rel="noopener noreferrer" target="_blank">
      {text}
    </a>
  );

  return (
    <InfoModal onClose={onClose}>
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
