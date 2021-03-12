import "../styles/global.css";
import { ChakraProvider } from "@chakra-ui/react";
import { DexesProvider } from "../providers/dexes";
import theme from "../theme";
import "focus-visible/dist/focus-visible";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <DexesProvider>
        <Component {...pageProps} />
      </DexesProvider>
    </ChakraProvider>
  );
}

export default MyApp;
