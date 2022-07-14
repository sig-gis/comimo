import React from "react";

import InfoModal from "../components/InfoModal";

export default function AppInfo({ onClose, isAdmin, localeText: { appInfo } }) {
  const downloadLink = () => (
    <>
      {isAdmin && (
        <a className="mr-2" href="/download-data">
          {appInfo.download}
        </a>
      )}
      <a href="/logout">{appInfo.logout}</a>
    </>
  );

  const extLink = (link, text) => (
    <a className="mt-2" href={link} rel="noopener noreferrer" target="_blank">
      {text}
    </a>
  );

  return (
    <InfoModal nextToClose={downloadLink()} onClose={onClose}>
      <h2>{appInfo.title}</h2>
      <h3 style={{ margin: "1rem 0" }}>{appInfo.termsOfUse}</h3>
      <p>{appInfo.shortTerms}</p>
      {extLink(appInfo.termsUrl, appInfo.viewTerms)}
      {extLink(appInfo.methodUrl, appInfo.viewMethod)}
      {extLink(appInfo.manualUrl, appInfo.viewManual)}
    </InfoModal>
  );
}
