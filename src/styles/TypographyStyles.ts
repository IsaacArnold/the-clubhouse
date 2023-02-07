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

    h2 {
        color: var(--primaryText);
        font-size: 36px;
        font-weight: 600;
        margin-top: 30px;
    }
`;

export default TypographyStyles;
