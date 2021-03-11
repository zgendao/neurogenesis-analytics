import { Text } from "@chakra-ui/layout";
import { Heading } from "@chakra-ui/layout";
import { Stack } from "@chakra-ui/layout";
import { Skeleton } from "@chakra-ui/skeleton";
import useFetch from "../../hooks/useFetch";

export default function Fees() {
  const { response, loading, error } = useFetch("api/gasPrice");

  return (
    <Stack spacing={3} direction="row">
      <FeeCard title="Low" loading={loading} color="green" {...response?.low} />
      <FeeCard
        title="Average"
        loading={loading}
        color="blue"
        {...response?.avg}
      />
      <FeeCard title="High" loading={loading} color="red" {...response?.high} />
    </Stack>
  );
}

function FeeCard({ title, color, gwei = "???", time, price, loading }) {
  return (
    <Stack w="100%" spacing={3} align="center">
      <Heading as="h5" size="sm" fontWeight="medium">
        {title}
      </Heading>
      <Skeleton isLoaded={!loading} px={5}>
        <Text fontSize="2xl" fontWeight="bold" sx={{ color: `${color}.400` }}>
          {gwei}
        </Text>
      </Skeleton>
      <Skeleton isLoaded={!loading} minW="80%" textAlign="center">
        <Text fontSize="sm">
          ${price?.toFixed(2)} | ~{time} secs
        </Text>
      </Skeleton>
    </Stack>
  );
}
