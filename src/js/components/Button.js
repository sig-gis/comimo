import styled from "@emotion/styled";

const getBackground = ({ theme, $type, disabled }) => {
  if (disabled) {
    return theme.disabled.background;
  } else if (theme[$type]?.background) {
    return theme[$type].background;
  } else {
    return theme.primary.background;
  }
};

const getColor = ({ theme, $type, disabled }) => {
  if (disabled) {
    return theme.disabled.color;
  } else if (theme[$type]?.color) {
    return theme[$type].color;
  } else {
    return theme.primary.color;
  }
};

const Button = styled.button`
  background: ${getBackground};
  border: none;
  border-radius: 0.25rem;
  color: ${getColor};
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  text-align: center;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
  padding: 0.2rem 0.5rem;
  vertical-align: middle;

  &:hover {
    filter: brightness(90%);
  }
`;

export default Button;
