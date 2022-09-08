import React, { useState } from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/react";

import SvgIcon from "./SvgIcon";
import { capitalize } from "lodash";
import IconTextButton from "./IconTextButton";

export default function LanguageSelector({ selectedLanguage, selectLanguage }) {
  const [show, setShow] = useState(false);

  const languages = { spanish: "es", english: "en" };

  const LanguageSelector = styled.div`
    height: 30px;
    display: flex;
    cursor: pointer;
    align-content: space-between;
    margin-bottom: 12px;
  `;

  const Options = styled.div`
    background: "white";
    border-bottom: "1px solid";
    border-right: "1px solid";
    border-left: "1px solid";
    width: "fit-content";
  `;

  const Option = styled.div`
    max-height: 100%;
    text-align: left;
    width: 200px;
    max-width: 100%;
    color: var(--white);
    background-color: #434343;
    padding-top: 8px;
    padding-bottom: 4px;
    padding-left: 6px;
    cursor: pointer;
  `;

  const Seperator = styled.hr`
    margin: 1px 0;
    border: 0;
    border-top: 1px solid var(--gray-2);
  `;

  const DropDownMenu = styled.div`
    border-radius: 0 3px 3px 0;
    height: 30px;
    max-height: var(--bar-height);
    z-index: 1;
  `;

  const onClickLangaugeOption = (language) => {
    selectLanguage(languages[language]);
    setShow(false);
  };
  const LanguageIcon = styled.div`
    height: 2rem;
    width: 2rem;
    background-color: var(--yellow-2);
    border-radius: 50%;
    display: inline-block;
  `;
  const LanguageText = styled.div`
    font-size: 18px;
    letter-spacing: 0px;
    text-decoration: underline;
    color: var(--white);
    margin-left: 0.5rem;
  `;

  const renderOption = (icon, title) => (
    <Option onClick={() => onClickLangaugeOption(title)}>
      <div
        css={css`
          display: flex;
        `}
      >
        <SvgIcon color="var(--gray-1)" icon={icon} size="2rem" />
        {capitalize(title)}
      </div>
      <Seperator />
    </Option>
  );

  return (
    <DropDownMenu>
      <LanguageSelector onClick={() => setShow(!show)}>
        <LanguageIcon>
          <SvgIcon color="var(--gray-1)" icon="language" size="2rem" />
        </LanguageIcon>
        <LanguageText>Language</LanguageText>
      </LanguageSelector>
      {show && (
        <Options>
          {Object.keys(languages).map((l) => (
            <div key={l}>{renderOption(l, l)}</div>
          ))}
        </Options>
      )}
    </DropDownMenu>
  );
}
