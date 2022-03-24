import styled from "styled-components";

const Button = styled.button`
  background: ${props => (props.disabled ? "#ddd" : "#f0ad4e")};
  border-color:  #eea236;
  border-radius: 3px;
  border: ${props => (props.disabled && "none")};
  color: ${props => (props.disabled ? "#aaa" : "#fff")};

  &:hover {
    background-color: #ff9f17;
  }
`;

export default Button;
