import React from "react";

import {isString} from "lodash";

function Option({option, valueKey = "value", labelKey = "label", disabled}) {
  const [value, label] = isString(option, "String")
    ? [option, option]
    : Array.isArray(option)
      ? [option[0], option[1]]
      : [option[valueKey], option[labelKey]];
  return (
    <option key={value} disabled={disabled} value={value}>{label} </option>
  );
}

export default function Select({
  disabled,
  label,
  id,
  onChange,
  value,
  options = [],
  valueKey,
  labelKey,
  defaultOption
}) {
  return (
    <div clssName="w-100">
      <label htmlFor={id}>{label}</label>
      <select
        className="col-12 pl-1"
        disabled={disabled}
        id={id}
        onChange={onChange}
        value={value}
      >
        <Option disabled option={[-1, defaultOption]} valueKey={valueKey}/>}
        {Array.isArray(options)
          ? options.map((o, i) =>
          /* eslint-disable-next-line react/no-array-index-key */
            <Option key={i} labelKey={labelKey} option={o} valueKey={valueKey}/>)
          : Object.values(options).map((o, i) =>
          /* eslint-disable-next-line react/no-array-index-key */
            <Option key={i} labelKey={labelKey} option={o} valueKey={valueKey}/>)}
      </select>
    </div>
  );
}
