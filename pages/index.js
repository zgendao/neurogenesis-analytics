import { Grid } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/layout";
import Charts from "./components/Charts";
import Summary from "./components/Summary";
import Fees from "./components/GasPrice";
import { GridItem } from "@chakra-ui/layout";

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
