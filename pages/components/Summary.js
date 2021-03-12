import { Text } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/layout";
import { Divider } from "@chakra-ui/layout";
import { Flex } from "@chakra-ui/layout";
import { Stack } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import { useContext, useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { DexesContext } from "../../providers/dexes";
import { filterObj } from "../../utils/filterObj";

const sumData = (obj, key, dexes) => {
  if (!obj || !dexes) return;
  const selectedDexesObj = filterObj(obj, (k, v) => dexes[k].active);
  return Object.values(selectedDexesObj)
    .reduce((res, cexObj) => res + cexObj[key], 0)
    .toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
};

export default function Summary() {
  const { response, loading, error } = useFetch("api/summary");
  const { dexes } = useContext(DexesContext);

  return (
    <Stack spacing={5} p={4}>
      <DataCard
        title="Total liquidity"
        amount={sumData(response, "totalLiquidity", dexes)}
        /* change={sumData(response, "dailyVolumeChange")} */
        loading={loading}
      />
      <Divider borderColor="gray.300" />
      <DataCard
        title="Volume"
        amount={sumData(response, "oneDayVolume", dexes)}
        loading={loading}
      />
      <Divider borderColor="gray.300" />
      <DataCard
        title="Fees"
        amount={sumData(response, "oneDayFee", dexes)}
        loading={loading}
      />
    </Stack>
  );
}

function DataCard({ title, amount = "?", change, loading }) {
  return (
    <Box>
      <Heading as="h5" pb={3} size="sm" fontWeight="medium">
        {title}
      </Heading>
      <Flex justifyContent="space-between">
        <Skeleton isLoaded={!loading} minWidth="50%">
          <Text fontSize="2xl" fontWeight="bold">
            {amount}
          </Text>
        </Skeleton>
        {/* {change ? <Text fontSize="sm">{change} %</Text> : null} */}
      </Flex>
    </Box>
  );
}
