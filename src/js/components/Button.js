import styled from "styled-components";

const Button = styled.button`
  color: ${props => (props.disabled ? "#aaa" : "#fff")};
  background: ${props => (props.disabled ? "#ddd" : "#f0ad4e")};
  ${props => (props.disabled ? "border: none" : "")};
  border-color:  #eea236};
  border-radius: 3px;
  &:hover {
    background-color: #ff9f17;
  }
`;

export default Button;
