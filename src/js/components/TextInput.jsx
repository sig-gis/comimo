import React, { useState } from "react";
import styled from "@emotion/styled";

const InputContainer = styled.div`
  display: flex;
  margin-bottom: 0.75rem;
`;

const Input = styled.input`
  padding: 0.25rem;
  margin: 0;
  margin-top: 0.25rem;
`;

// TODO: Add showing error like when in searching for invalide coordinates...

export default function TextInput({
  id = "textinput",
  className = "",
  label = "",
  maxLength = 60,
  onChange = () => {},
  onKeyUp = () => {},
  value = "",
  type = "text",
  placeholder = "",
  render = null,
  required = false,
}) {
  const [touched, setTouched] = useState(false);
  const error = required && touched && value.length === 0;
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      {type === "textarea" ? (
        <textarea
          style={{ width: "100%" }}
          id={id}
          maxLength={maxLength}
          onBlur={() => setTouched(true)}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows="4"
          value={value}
        />
      ) : (
        <InputContainer>
          <Input
            className={className}
            id={id}
            maxLength={maxLength}
            onBlur={() => setTouched(true)}
            onChange={onChange}
            onKeyUp={onKeyUp}
            placeholder={placeholder}
            required={required}
            style={{ flexGrow: 1 }}
            type={type || "text"}
            value={value}
          />
          {render && render()}
        </InputContainer>
      )}
      {error && (
        <div className="invalid-feedback" style={{ display: "block" }}>
          {`${label || "This field "} is required.`}
        </div>
      )}
    </div>
  );
}
