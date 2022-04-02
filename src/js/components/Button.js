import styled from "styled-components";

export default styled.button`
  background: ${props => (props.disabled ? "#ddd" : "#f0ad4e")};
  border-color: #462f0f;
  border-radius: 3px;
  color: #fff;
  border: ${props => (props.disabled && "none")};
  color: ${props => (props.disabled ? "#aaa" : "#fff")};

  &:hover {
    background-color: #c57a12;
    border-color: #462f0f;
  }
`;
