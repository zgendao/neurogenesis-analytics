import { useContext, useEffect, useState } from "react";
import { Button } from "@chakra-ui/button";
import { ButtonGroup } from "@chakra-ui/button";
import { registerables } from "chart.js";
import "chartjs-adapter-dayjs";
import dynamic from "next/dynamic";
//doesn't have a commonjs export so Next can't load it on SSR,
//so we load it dynamically on the client
const ReactChart = dynamic(
  () =>
    import("chartjs-react").then((mod) => {
      mod.ReactChart.register(...registerables);
      return mod.ReactChart;
    }),
  { ssr: false }
);

import useFetch from "../../hooks/useFetch";
import { CircularProgress } from "@chakra-ui/progress";
import { Flex } from "@chakra-ui/layout";
import { DexesContext } from "../../providers/dexes";
import { filterObj } from "../../utils/filterObj";

const charts = [
  {
    name: "Volume",
    yAxisKey: {
      daily: "dailyVolumeUSD",
      weekly: "weeklyVolumeUSD",
    },
  },
  {
    name: "Liquidity",
    yAxisKey: {
      daily: "totalLiquidityUSD",
      weekly: "weeklyAvgLiquidityUSD",
    },
  },
  {
    name: "Fees",
    yAxisKey: {
      daily: "txFee",
      weekly: "txFee",
    },
  },
];

const aggregationUnits = ["daily", "weekly"];

const chartOptions = {
  plugins: {
    legend: {
      position: "bottom",
    },
    tooltip: {
      intersect: false,
    },
    decimation: {
      enabled: true,
    },
  },
  scales: {
    x: {
      type: "time",
      time: {
        parser: (ts) => ts * 1000,
      },
    },
  },
  elements: {
    point: {
      radius: 0,
    },
  },
};

export default function Charts() {
  const { response, loading, error } = useFetch("api/chartData");
  const { dexes } = useContext(DexesContext);

  const [selectedDexes, setSelectedDexes] = useState(dexes);
  const [selectedView, setSelectedView] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    setSelectedDexes(filterObj(dexes, (k, v) => v.active));
  }, [dexes]);

  useEffect(() => {
    if (!response) return;
    setChartData({
      datasets: Object.entries(selectedDexes).map(
        ([key, { label, color }]) => ({
          label,
          data: response[key][aggregationUnits[selectedUnit] + "Data"],
          borderColor: color,
          parsing: {
            xAxisKey: "date",
            yAxisKey:
              charts[selectedView].yAxisKey[aggregationUnits[selectedUnit]],
          },
        })
      ),
    });
  }, [response, selectedUnit, selectedView, dexes]);

  return (
    <>
      <Flex justifyContent="space-between">
        <ButtonGroup spacing={2} pb={8}>
          {charts.map(({ name }, i) => (
            <Button
              key={i}
              bg={selectedView === i ? "gray.300" : ""}
              onClick={() => setSelectedView(i)}
            >
              {name}
            </Button>
          ))}
        </ButtonGroup>
        <ButtonGroup spacing={2} pb={8}>
          {aggregationUnits.map((unit, i) => (
            <Button
              key={i}
              bg={selectedUnit === i ? "gray.300" : ""}
              onClick={() => setSelectedUnit(i)}
            >
              {unit}
            </Button>
          ))}
        </ButtonGroup>
      </Flex>
      {loading ? (
        <Flex
          w="100%"
          h="400px"
          position="relative"
          alignItems="center"
          justifyContent="center"
        >
          <CircularProgress
            isIndeterminate
            position="absolute"
            color="gray.600"
          />
        </Flex>
      ) : (
        <ReactChart
          type="line"
          data={chartData}
          options={chartOptions}
          height={175}
        />
      )}
    </>
  );
}
