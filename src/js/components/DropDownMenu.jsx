import React, { useEffect } from "react";
import styled from "@emotion/styled";

import SvgIcon from "./SvgIcon";

const PanelOuter = styled.div`
  background: var(--gray-option);
  border-radius: 0 0 6px 6px;
  border: 1px solid;
  border-color: var(--gray-1);
  display: ${({ active }) => (active ? "flex" : "none")};
  flex-direction: column;
  overflow: hidden;
  position: absolute;
  top: var(--bar-height);
  z-index: 99;
`;

const Option = styled.div`
  align-items: center;
  background-color: ${({ selected }) => (selected ? "var(--gray-1)" : "var(--gray-option)")};
  color: var(--white);
  cursor: pointer;
  display: flex;
  max-height: 100%;
  max-width: 100%;
  padding-left: 6px;
  text-align: left;
  text-decoration: ${({ selected }) => selected && "underline"};
  width: 200px;

  &:hover {
    background-color: "var(--gray-1)";
  }
`;

const OptionText = styled.p`
  color: var(--white);
  font: var(--unnamed-font-style-normal) normal medium 16px / var(--unnamed-line-spacing-16)
    var(--unnamed-font-family-roboto);
  padding-left: 5px;

  &:hover {
    text-decoration: underline;
  }
`;

const Seperator = styled.hr`
  border-top: 1px solid;
  border-color: ${({ selected }) => (selected ? "var(--yellow-brand)" : "var(--gray-2)")};
  margin: 1px 6px 5px 6px;

  &:hover {
    border-color: "var(--yellow-brand)";
  }
`;

export default function DropDownMenu({
  active,
  options,
  optionOnClick,
  selected,
  setActiveDropdownMenu,
}) {
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.keyCode === 27) {
        setActiveDropdownMenu(null);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [active]);

  const renderOption = (val) => {
    const { icon, value, text } = val;
    return (
      <>
        <Option selected={selected === value} onClick={() => optionOnClick(value)}>
          <SvgIcon color="var(--gray-1)" icon={icon} size="32px" />
          <OptionText>{text}</OptionText>
        </Option>
        <Seperator selected={selected === value} />
      </>
    );
  };

  return (
    <PanelOuter active={active}>
      {active && (
        <>
          {Object.entries(options).map(([key, val]) => (
            <div key={key}> {renderOption(val)}</div>
          ))}
        </>
      )}
    </PanelOuter>
  );
}
