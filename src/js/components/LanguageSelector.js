import React, {useState} from "react";

import SvgIcon from "./SvgIcon";

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
      style={{height: "30px", maxHeight: "30px"}}
    >
      <img
        alt={language}
        src={`/img/${languageList[language]}`}
        style={{maxWidth: "100%", maxHeight: "100%"}}
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
        zIndex: 1
      }}
    >
      <div style={{display: "flex", height: "100%"}}>
        {renderOption(selectedLanguage)}
        <div
          style={{
            background: "white",
            borderRadius: "0 3px 3px 0",
            border: "2px solid black",
            paddingTop: "2px",
            width: "18px"
          }}
        >
          <SvgIcon icon="down"/>
        </div>
      </div>
      {show && (
        <div
          style={{
            background: "white",
            borderBottom: "1px solid",
            borderRight: "1px solid",
            borderLeft: "1px solid",
            width: "fit-content"
          }}
        >
          {Object.keys(languageList).map(l => (
            <div key={l} className="pt-1">{renderOption(l)}</div>
          ))}
        </div>
      )}

    </div>
  );
}
