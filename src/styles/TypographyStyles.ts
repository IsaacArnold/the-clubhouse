import { createGlobalStyle } from "styled-components";

const TypographyStyles = createGlobalStyle`
    @font-face {
        font-family: 'Poppins', sans-serif;
    }

    * {
        font-family: "Poppins", "serif";
        box-sizing: border-box;
        scroll-behavior: smooth;
    }

    h1 {
        color: var(--primaryText);
        font-size: 40px;
        font-weight: 600;
    }

    h2 {
        color: var(--primaryText);
        font-size: 36px;
        font-weight: 500;
    }
`;

export default TypographyStyles;
