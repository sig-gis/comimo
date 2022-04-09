import styled from "styled-components";

const getBackground = ({theme, $type, disabled}) => {
  if (disabled) {
    return "#ddd";
  } else if (theme[$type]?.background) {
    return theme[$type].background;
  } else {
    return theme.primary.background;
  }
};

const getColor = ({disabled}) => {
  if (disabled) {
    return "#999";
  } else {
    return "#ddd";
  }
};

const Button = styled.button`
  background: ${getBackground};
  border: ${props => "1px solid " + getColor(props)};
  border-radius: .25rem;
  color: ${getColor};
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out;
  padding: .2rem .5rem;
  vertical-align: middle;

  &:hover {
    filter: brightness(90%);
  }
`;

export default Button;
