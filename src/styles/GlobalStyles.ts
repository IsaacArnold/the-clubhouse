import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    @font-face {
        font-family: 'Poppins', sans-serif;
    }

    :root {
        --primaryWhite: #F4F5FA;
        --primaryGreen: #4B9D6F;
        --primaryText: #373B40;
        --lightenedGray: rgba(55, 59, 64, 0.57);
    }

    * {
        font-family: "Poppins", "serif";
        box-sizing: border-box;
        scroll-behavior: smooth;
    }

    body {
        height: 100vh;
        background-color: var(--primaryWhite);
    }
`;

export default GlobalStyles;
