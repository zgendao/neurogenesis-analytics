import { Text } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/layout";
import { Divider } from "@chakra-ui/layout";
import { Flex } from "@chakra-ui/layout";
import { Stack } from "@chakra-ui/layout";
import { Box } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import useFetch from "../../hooks/useFetch";

const sumData = (obj, key) => {
  if (!obj) return;
  console.log(obj);
  return Object.values(obj)
    .reduce((res, cexObj) => res + cexObj[key], 0)
    .toFixed(2);
};

export default function Summary() {
  const { response, loading, error } = useFetch("api/summary");

  return (
    <Stack spacing={5} p={4}>
      <DataCard
        title="Total liquidity"
        amount={sumData(response, "totalLiquidity")}
        /* change={sumData(response, "dailyVolumeChange")} */
        loading={loading}
      />
      <Divider borderColor="gray.300" />
      <DataCard
        title="Volume"
        amount={sumData(response, "oneDayVolume")}
        loading={loading}
      />
      <Divider borderColor="gray.300" />
      <DataCard
        title="Fees"
        amount={sumData(response, "oneDayFee")}
        loading={loading}
      />
    </Stack>
  );
}

function DataCard({ title, amount, change, loading }) {
  return (
    <Box>
      <Heading as="h5" pb={3} size="sm" fontWeight="medium">
        {title}
      </Heading>
      <Flex justifyContent="space-between">
        <Skeleton isLoaded={!loading} minWidth="50%">
          <Text fontSize="2xl" fontWeight="bold">
            ${amount}
          </Text>
        </Skeleton>
        {/* {change ? <Text fontSize="sm">{change} %</Text> : null} */}
      </Flex>
    </Box>
  );
}
