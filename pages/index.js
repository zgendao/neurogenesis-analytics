import { Grid } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/layout";
import Charts from "./components/Charts";
import Summary from "./components/Summary";
import Fees from "./components/GasPrice";
import { GridItem } from "@chakra-ui/layout";
import { DexesContext } from "../providers/dexes";
import { useContext } from "react";
import { Button, ButtonGroup } from "@chakra-ui/button";
import { CheckIcon } from "@chakra-ui/icons";

export default function Home() {
  return (
    <Box
      maxW={{ base: "xl", md: "7xl" }}
      mx="auto"
      px={{ base: "6", md: "8" }}
      py="16"
    >
      <Heading as="h1" pb={14}>
        Neurogenesis Analytics
      </Heading>
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
  );
}

function Card(props) {
  return (
    <GridItem
      {...props}
      p={5}
      bg="gray.100"
      borderRadius={10}
      position="relative"
    >
      {props.children}
    </GridItem>
  );
}

function DexesSelector() {
  const { dexes, toggleDex } = useContext(DexesContext);

  return (
    <ButtonGroup spacing={2} pb={8}>
      {Object.keys(dexes).map((key, i) => (
        <Button
          key={key}
          variant={dexes[key].active ? "solid" : "outline"}
          leftIcon={dexes[key].active ? <CheckIcon /> : null}
          onClick={() => toggleDex(key)}
        >
          {dexes[key].label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
