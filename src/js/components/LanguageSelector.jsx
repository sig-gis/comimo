import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";

import IconTextButton from "./IconTextButton";
import DropDownMenu from "./DropDownMenu";

export default function LanguageSelector({ selectedLanguage, selectLanguage }) {
  const [show, setShow] = useState(false);
  const { t } = useTranslation();

  const languages = {
    es: { icon: "spanish", value: "es", text: "Español" },
    en: { icon: "english", value: "en", text: "English" },
  };

  const onClickLangaugeOption = (language) => {
    selectLanguage(language);
    setShow(false);
  };

  return (
    <div>
      <IconTextButton
        active={show}
        hasBackground={false}
        icon="language"
        iconSize="26px"
        onClick={() => setShow(!show)}
        text={t("home.language")}
      />
      <DropDownMenu
        active={show}
        options={languages}
        optionOnClick={onClickLangaugeOption}
        selected={selectedLanguage}
      />
    </div>
  );
}
