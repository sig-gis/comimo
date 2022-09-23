import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

import InfoModal from "../components/InfoModal";
import { renderMessageBox } from "../components/Modal";

const Links = styled.div`
  display: flex;
  flex-direction: column;
`;

const BoldParagraph = styled.p`
  font-weight: var(--unnamed-font-weight-bold);
`;

export default function AppInfo({ onClose }) {
  const { t } = useTranslation();
  const [messageBox, setMessageBox] = useState(null);

  const showAlert = (newMessageBox) => {
    setMessageBox({ ...newMessageBox });
  };

  const extLink = (link, text) => (
    <a
      style={{
        color: "var(--links)",
        marginTop: "0.5rem",
        font: "var(--unnamed-font-style-normal) normal bold 16px/28px var(--unnamed-font-family-roboto)",
        letterSpacing: "var(--unnamed-character-spacing-0)",
      }}
      href={link}
      rel="noopener noreferrer"
      target="_blank"
    >
      {text}
    </a>
  );

  return (
    <InfoModal onClose={onClose} title={t("appInfo.title")}>
      <p>{t("appInfo.shortTerms")}</p>
      <BoldParagraph>{t("appInfo.accessAll")}</BoldParagraph>
      <Links>
        {extLink(t("appInfo.termsUrl"), t("appInfo.viewTerms"))}
        {extLink(t("appInfo.methodUrl"), t("appInfo.viewMethod"))}
        {extLink(t("appInfo.manualUrl"), t("appInfo.viewManual"))}
      </Links>
      {renderMessageBox(messageBox, () => setMessageBox(null))}
    </InfoModal>
  );
}
