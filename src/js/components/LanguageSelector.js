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
      style={{
        background: "white",
        zIndex: 10000,
        height: "30px",
        maxHeight: "30px",
        borderRadius: "0 3px 3px 0"
      }}
    >
      <div style={{display: "flex"}}>
        {renderOption(selectedLanguage)}
        <div
          onClick={() => setShow(!show)}
          style={{
            width: "18px",
            paddingTop: "2px",
            borderRadius: "0 3px 3px 0",
            border: "2px solid black"
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
              <div className="pt-1">{renderOption(l)}</div>

            ))}
          </div>
        </div>
      )}

    </div>
  );
}
