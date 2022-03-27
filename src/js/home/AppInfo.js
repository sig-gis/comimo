import React, {useContext} from "react";

import {MainContext} from "./constants";

import InfoModal from "../components/InfoModal";

export default function AppInfo({onClose}) {
  const {isAdmin, localeText: {appInfo}} = useContext(MainContext);
  return (
    <InfoModal
      onClose={onClose}
      render={() => (
        <div>
          {isAdmin && (
            <a className="ml-2" href="/download-data">
              {appInfo.download}
            </a>
          )}
          <a href="/logout">{appInfo.logout}</a>
        </div>
      )}
    >
      <h2>{appInfo.title}</h2>
      <h3 style={{margin: "1rem 0"}}>{appInfo.termsOfUse}</h3>
      <p>{appInfo.shortTerms}</p>
      <a
        className="mt-2"
        href={appInfo.termsUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {appInfo.viewTerms}
      </a>
      <a
        className="mt-2"
        href={appInfo.methodUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {appInfo.viewMethod}
      </a>
      <a
        className="mt-2"
        href={appInfo.manualUrl}
        rel="noopener noreferrer"
        target="_blank"
      >
        {appInfo.viewManual}
      </a>
    </InfoModal>
  );
}
