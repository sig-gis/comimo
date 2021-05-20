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
        src={`/static/images/${languageList[language]}`}
        style={{maxWidth: "100%", maxHeight: "100%"}}
      />
    </div>
  );

  return (
    <div
      onClick={() => setShow(!show)}
      style={{
        zIndex: 1,
        height: "30px",
        maxHeight: "30px",
        borderRadius: "0 3px 3px 0"
      }}
    >
      <div style={{display: "flex", height: "100%"}}>
        {renderOption(selectedLanguage)}
        <div
          style={{
            width: "18px",
            paddingTop: "2px",
            borderRadius: "0 3px 3px 0",
            border: "2px solid black",
            background: "white"
          }}
        >
          <SvgIcon icon="down"/>
        </div>
      </div>
      {show && (
        <div>
          <div
            style={{
              background: "white",
              width: "fit-content",
              borderBottom: "1px solid",
              borderRight: "1px solid",
              borderLeft: "1px solid"
            }}
          >
            {Object.keys(languageList).map(l => (
              <div key={l} className="pt-1">{renderOption(l)}</div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
