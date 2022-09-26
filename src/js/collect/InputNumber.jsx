import React from "react";
import styled from "@emotion/styled";

const OuterContainer = styled.div`
  display: flex;
  height: 40px;
`;
const Buttons = styled.div`
  display: flex;
  flex-direction: column;
`;

const ButtonIncrease = styled.button`
  background: #ffffff 0% 0% no-repeat padding-box;
  border: 1px solid;
  border-color: var(--gray-2);
  border-radius: 0px 4px 0px 0px;
  cursor: pointer;
  height: 20px;

  &:hover {
    background-color: var(--orange-4);
  }
`;

const ButtonDecrease = styled.button`
  background: #ffffff 0% 0% no-repeat padding-box;
  border: 1px solid;
  border-color: var(--gray-2);
  border-radius: 0px 0px 4px 0px;
  cursor: pointer;
  height: 20px;

  &:hover {
    background-color: var(--orange-4);
  }
`;

const InputNumber = ({
  autoComplete,
  id,
  min,
  max,
  onChange,
  onClickIncrease,
  onClickDecrease,
  onKeyDown,
  value,
  extraStyle,
}) => (
  <OuterContainer style={extraStyle}>
    <input
      autoComplete={autoComplete}
      id={id}
      min={min}
      max={max}
      onChange={onChange}
      onKeyDown={onKeyDown}
      type="number"
      value={value}
    />
    <Buttons>
      <ButtonIncrease onClick={onClickIncrease}>+</ButtonIncrease>
      <ButtonDecrease onClick={onClickDecrease}>-</ButtonDecrease>
    </Buttons>
  </OuterContainer>
);

export default InputNumber;
