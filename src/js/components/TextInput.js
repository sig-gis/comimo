import React, {useState} from "react";
import tw from "twin.macro";

const InputContainer = tw.div`flex mb-3`;
const Input = tw.input`mt-1 p-1 m-0`;

// TODO: Add showing error like when in searching for invalide coordinates...

export default function TextInput({
  id = "textinput",
  className = "",
  label = "",
  maxLength = 12,
  onChange = () => {},
  onKeyUp = () => {},
  value = "",
  type = "text",
  placeholder = "",
  render = null,
  required = false
}) {
  const [touched, setTouched] = useState(false);
  const error = required && touched && value.length === 0;
  return (
    <div className="w-100">
      {label && (
        <label htmlFor={id}>
          {label}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          className="col-12"
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
            style={{flexGrow: 1}}
            type={type || "text"}
            value={value}
          />
          {render && render()}
        </InputContainer>
      )}
      {error && (
        <div className="invalid-feedback" style={{display: "block"}}>
          {`${label || "This field "} is required.`}
        </div>
      )}
    </div>
  );
}
