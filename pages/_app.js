import { ChakraProvider } from "@chakra-ui/react";
import { DexesProvider } from "../providers/dexes";
import "focus-visible/dist/focus-visible";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <DexesProvider>
        <Component {...pageProps} />
      </DexesProvider>
    </ChakraProvider>
  );
}

export default MyApp;
