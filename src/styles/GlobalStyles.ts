import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
    @font-face {
        font-family: 'Poppins', sans-serif;
    }

    :root {
        --primaryWhite: #F4F5FA;
        --primaryGreen: #4B9D6F;
        --primaryText: #373B40;
        --primaryGray: #D9D9D9;
        --lightenedGray: rgba(55, 59, 64, 0.57);
        --lightenedGreen: rgba(75,157,111,0.32);
    }

    * {
        font-family: "Poppins", sans-serif;
        box-sizing: border-box;
        scroll-behavior: smooth;
    }

    body {
        height: 100vh;
        background-color: var(--primaryWhite);
    }
`;

export default GlobalStyles;
