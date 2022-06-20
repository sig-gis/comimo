import React from "react";

import {isString} from "lodash";

function Option({option, valueKey = "value", labelKey = "label", disabled}) {
  const [value, label] = isString(option, "String")
    ? [option, option]
    : Array.isArray(option)
      ? [option[0], option[1]]
      : [option[valueKey], option[labelKey]];
  return (
    <option key={value} disabled={disabled} value={value}>{label}</option>
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
  defaultOption = ""
}) {
  return (
    <div className="w-100 mb-3">
      <label htmlFor={id}>{label}</label>
      <select
        className="col-12 p-1 mt-1"
        disabled={disabled}
        id={id}
        onChange={onChange}
        value={value}
      >
        <Option disabled labelKey={labelKey} option={[-1, defaultOption]} valueKey={valueKey}/>
        {Array.isArray(options)
          ? options.map(o =>
          /* eslint-disable-next-line react/no-array-index-key */
            <Option labelKey={labelKey} valueKey={valueKey} option={o}/>)
          : Object.values(options).map(o =>
          /* eslint-disable-next-line react/no-array-index-key */
            <Option labelKey={labelKey} valueKey={valueKey} option={o}/>)}
      </select>
    </div>
  );
}
