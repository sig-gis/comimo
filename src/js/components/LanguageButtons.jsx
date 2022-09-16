import React, { useState } from "react";
import styled from "@emotion/styled";

import SvgIcon from "./SvgIcon";
import Button from "./Button";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "i18next";

const Buttons = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

const IconContainer = styled.div`
  display: flex;
`;

export default function LanguageButtons({ selectedLanguage, selectLanguage }) {
  const { i18n } = useTranslation();

  const changeLanguage = (language) => {
    selectLanguage(language);
    i18n.changeLanguage(language, (err, t) => {
      if (err) return console.log("something went wrong loading", err);
    });
  };

  return (
    <Buttons>
      <Button
        active={selectedLanguage === "en"}
        onClick={(e) => {
          e.preventDefault();
          changeLanguage("en");
        }}
      >
        <IconContainer>
          <SvgIcon extraStyle={{ marginRight: "5px" }} icon="english" size="16px" />
          English
        </IconContainer>
      </Button>
      <Button
        extraStyle={{ marginLeft: "15px" }}
        active={selectedLanguage === "es"}
        onClick={(e) => {
          e.preventDefault();
          changeLanguage("es");
        }}
      >
        <IconContainer>
          <SvgIcon extraStyle={{ marginRight: "5px" }} icon="spanish" size="16px" />
          Español
        </IconContainer>
      </Button>
    </Buttons>
  );
}
