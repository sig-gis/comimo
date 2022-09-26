import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai";

import IconTextButton from "./IconTextButton";
import DropDownMenu from "./DropDownMenu";
import { activeDropDownMenuAtom } from "./PageLayout";

export default function LanguageSelector({ selectedLanguage, selectLanguage }) {
  const [activeDropdownMenu, setActiveDropdownMenu] = useAtom(activeDropDownMenuAtom);
  const { t } = useTranslation();

  const languages = {
    es: { icon: "spanish", value: "es", text: "Español" },
    en: { icon: "english", value: "en", text: "English" },
  };

  const onClickLangaugeOption = (language) => {
    selectLanguage(language);
    setActiveDropdownMenu(null);
  };

  return (
    <div>
      <IconTextButton
        active={activeDropdownMenu === "language"}
        hasBackground={false}
        icon="language"
        iconSize="26px"
        onClick={(e) => {
          setActiveDropdownMenu("language");
          e.stopPropagation();
        }}
        text={t("home.language")}
      />
      <DropDownMenu
        active={activeDropdownMenu === "language"}
        options={languages}
        optionOnClick={onClickLangaugeOption}
        selected={selectedLanguage}
        setActiveDropdownMenu={setActiveDropdownMenu}
      />
    </div>
  );
}
