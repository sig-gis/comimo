import React from "react";
import styled from "@emotion/styled";

import { isString } from "lodash";

const Label = styled.label`
  font: var(--unnamed-font-style-normal) var(--unnamed-font-weight-medium)
    var(--unnamed-font-size-16) / var(--unnamed-line-spacing-19) var(--unnamed-font-family-roboto);
  letter-spacing: var(--unnamed-character-spacing-0);
  color: var(--black);
  text-align: left;
`;

function Option({ option, valueKey = "value", labelKey = "label", disabled }) {
  const [value, label] = isString(option, "String")
    ? [option, option]
    : Array.isArray(option)
    ? [option[0], option[1]]
    : [option[valueKey], option[labelKey]];
  return (
    <option key={value} disabled={disabled} value={value}>
      {label}
    </option>
  );
}

export default function Select({
  disabled = false,
  label = "",
  id = "select",
  onChange = () => {},
  value = "",
  options = [],
  valueKey = "value",
  labelKey = "label",
  defaultOption = "",
}) {
  return (
    <div
      style={{
        marginBottom: "0.5rem",
        cursor: disabled && "not-allowed",
      }}
    >
      <div style={{ pointerEvents: disabled && "none" }}>
        <Label htmlFor={id}>{label}</Label>
        <select
          style={{
            width: "100%",
            cursor: !disabled && "pointer",
            padding: "0.25rem",
            marginTop: "0.25rem",
          }}
          disabled={disabled}
          id={id}
          onChange={onChange}
          value={value}
        >
          <Option
            key="defaultOption"
            disabled
            labelKey={labelKey}
            option={[-1, defaultOption]}
            valueKey={valueKey}
          />
          {Array.isArray(options)
            ? options.map((o, i) => (
                <Option key={i} labelKey={labelKey} option={o} valueKey={valueKey} />
              ))
            : Object.values(options).map((o, i) => (
                <Option key={i} labelKey={labelKey} option={o} valueKey={valueKey} />
              ))}
        </select>
      </div>
    </div>
  );
}
