import styled from "styled-components";

const Button = styled.button`
  background-color: var(--primaryGreen);
  opacity: 0.3;
  color: var(--primaryText);
  display: flex;
`;

const GoogleBtn = () => {
  return (
    <Button>
      <p>Test</p>
      <p>Sign in with Google</p>
    </Button>
  );
};

export default GoogleBtn;
