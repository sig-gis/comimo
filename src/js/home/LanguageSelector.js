import React, {useState} from "react";

import SvgIcon from "../SvgIcon";

export default function LanguageSelector({selectedLanguage, selectLanguage}) {
  const [show, setShow] = useState(false);

  const languageList = {
    es: "colombia.png",
    en: "united-states.png"
  };

  const renderOption = language => (
    <div
      onClick={() => {
        selectLanguage(language);
        setShow(false);
      }}
      style={{width: "42px", maxWidth: "42px"}}
    >
      <img
        alt={language}
        src={`/static/images/${languageList[language]}`}
        style={{maxWidth: "100%", maxHeight: "100%"}}
      />
    </div>
  );

  return (
    <div
      style={{
        background: "white",
        position: "fixed",
        top: "1rem",
        right: "4rem",
        zIndex: 10000,
        height: "28px",
        maxHeight: "28px",
        borderRadius: "0 3px 3px 0"
      }}
    >
      <div style={{display: "flex"}}>
        {renderOption(selectedLanguage)}
        <div
          onClick={() => setShow(!show)}
          style={{
            width: "18px",
            paddingTop: "4px",
            borderRadius: "0 3px 3px 0"
          }}
        >
          <SvgIcon icon="down"/>
        </div>
      </div>
      {show && (
        <div>
          {Object.keys(languageList).map(l => (
            renderOption(l)
          ))}
        </div>
      )}

    </div>
  );
}
