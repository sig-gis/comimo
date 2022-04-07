import styled from "styled-components";

const Button = styled.button`
  background: ${props => (props.disabled ? "#ddd" : "#f0ad4e")};
  border: ${props => (props.disabled && "none")};
  border-color: #462f0f;
  border-radius: 3px;
  color: ${props => (props.disabled ? "#aaa" : "#fff")};

  &:hover {
    background-color: #c57a12;
    border-color: #462f0f;
  }
`;

export default Button;
