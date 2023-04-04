import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import GlobalStyles from "@/styles/GlobalStyles";
import TypographyStyles from "@/styles/TypographyStyles";
import styled from "styled-components";
import { Provider } from "react-redux";
import { store } from "../store/store";

const LayoutContainer = styled.main`
  display: flex;
  flex-direction: column;
  padding: 0 15px;
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <ChakraProvider>
        <GlobalStyles />
        <TypographyStyles />
        <LayoutContainer>
          <Component {...pageProps} />
        </LayoutContainer>
      </ChakraProvider>
    </Provider>
  );
}
