import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";

import "../styles/design_tokens.scss";
import "../styles/globalStyles.scss";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <div className="layoutContainer">
        <Component {...pageProps} />
      </div>
    </ChakraProvider>
  );
}
