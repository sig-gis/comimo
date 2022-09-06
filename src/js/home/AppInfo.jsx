import React, { useState, useContext } from "react";
import styled from "@emotion/styled";

import InfoModal from "../components/InfoModal";
import Modal from "../components/Modal";
import { MainContext } from "../components/PageLayout";

const Links = styled.div`
  display: flex;
  flex-direction: column;
`;

const BoldParagraph = styled.p`
  font-weight: var(--unnamed-font-weight-bold);
`;

export default function AppInfo({ onClose, isAdmin }) {
  const {
    localeText: { appInfo },
  } = useContext(MainContext);
  const [messageBox, setMessageBox] = useState(null);

  const showAlert = (newMessageBox) => {
    setMessageBox({ ...newMessageBox });
  };

  const hideAlert = () => setMessageBox(null);

  const extLink = (link, text) => (
    <a style={{ marginTop: "0.5rem" }} href={link} rel="noopener noreferrer" target="_blank">
      {text}
    </a>
  );

  return (
    <InfoModal onClose={onClose} title={appInfo.title}>
      <p>{appInfo.shortTerms}</p>
      <BoldParagraph>{appInfo.accessAll}</BoldParagraph>
      <Links>
        {extLink(appInfo.termsUrl, appInfo.viewTerms)}
        {extLink(appInfo.methodUrl, appInfo.viewMethod)}
        {extLink(appInfo.manualUrl, appInfo.viewManual)}
      </Links>
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
