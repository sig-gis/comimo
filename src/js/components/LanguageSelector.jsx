import React, { useState } from "react";
import styled from "@emotion/styled";

import SvgIcon from "./SvgIcon";


export default function LanguageSelector({ selectedLanguage, selectLanguage }) {
  const [show, setShow] = useState(false);

  const languageList = {
    es: "colombia.png",
    en: "united-states.png",
  };

  // const languageSelector = styled.div`
  //   text-align: left;
  //   font-size: 18px;
  //   font-weight: var(--unnamed-font-weight-medium);
  //   letter-spacing: 0px;
  //   color: var(--white);
  //   padding: 0 0.5rem;

  //   &:hover {
  //     text-decoration: underline;
  //   }
  // `;

  const LanguageSelector = styled.div`
    display: flex;
    text-align: left;
  `;
  const languageIcon = styled.div`
    color: var(--red);
  `
  const LanguageText = styled.div`
    font-size: 18px
    letter-spacing: 0px;
    text-decoration: underline;
  `;

  const LanguageOption = styled.div`
    /* text-align: left; */
    font-size:16px
    /* letter-spacing: 0px; */
    /* color: #ffffff; */
  `;

  const showLanguageOption = (language) => (
    <div
      onClick={() => {
        // selectLanguage(language);
        // setShow(false);
      }}
      style={{ height: "30px", maxHeight: "30px" }}
    >
      <img
        alt={language}
        src={`/img/${languageList[language]}`}
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
    </div>
  );



  const renderOption = (language) => (
    <div
      onClick={() => {
        selectLanguage(language);
        setShow(false);
      }}
      style={{ height: "30px", maxHeight: "30px" }}
    >
      <img
        alt={language}
        src={`/img/${languageList[language]}`}
        style={{ maxWidth: "100%", maxHeight: "100%" }}
      />
    </div>
  );

  return (
    <div
      onClick={() => setShow(!show)}
      style={{
        borderRadius: "0 3px 3px 0",
        height: "30px",
        maxHeight: "30px",
        zIndex: 1,
      }}
    >
      <div style={{ display: "flex", height: "100%" }}>
        {renderOption(selectedLanguage)}
        <div
          style={{
            background: "white",
            borderRadius: "0 3px 3px 0",
            border: "2px solid black",
            paddingTop: "2px",
            width: "18px",
          }}
        >
          <SvgIcon icon="down" />
        </div>
      </div>
      {show && (
        <div
          style={{
            background: "white",
            borderBottom: "1px solid",
            borderRight: "1px solid",
            borderLeft: "1px solid",
            width: "fit-content",
          }}
        >
          {Object.keys(languageList).map((l) => (
            <div key={l} style={{ paddingTop: "0.25rem" }}>
              {renderOption(l)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
