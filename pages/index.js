import { Flex, Grid } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/layout";
import Charts from "./components/Charts";
import Summary from "./components/Summary";
import Fees from "./components/GasPrice";
import { GridItem } from "@chakra-ui/layout";
import { Button, IconButton } from "@chakra-ui/button";
import { useColorMode, useColorModeValue } from "@chakra-ui/color-mode";
import DexesSelector from "./components/DexesSelector";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/tooltip";
import Head from "next/head";

export default function Home() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <>
      <Head>
        <title>Neurogenesis Analytics</title>
      </Head>
      <Box
        maxW={{ base: "xl", md: "7xl" }}
        mx="auto"
        px={{ base: "6", md: "8" }}
        py="16"
      >
        <Flex justifyContent="space-between">
          <Heading as="h1" pb={14}>
            Neurogenesis Analytics
          </Heading>
          <Tooltip
            label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
          >
            <IconButton
              aria-label="Toggle theme"
              mt={2}
              isRound
              variant="ghost"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
            />
          </Tooltip>
        </Flex>
        <DexesSelector />
        <Grid templateColumns="2fr 3fr" gap={5} w="100%" h="400">
          <Card>
            <Summary />
          </Card>
          <Card>
            <Fees />
          </Card>
          <Card rowStart={1} rowSpan={2} colStart={2}>
            <Charts />
          </Card>
        </Grid>
      </Box>
    </>
  );
}

function Card(props) {
  const bg = useColorModeValue("gray.100", "gray.700");

  return (
    <GridItem {...props} p={5} bg={bg} borderRadius={10} position="relative">
      {props.children}
    </GridItem>
  );
}
