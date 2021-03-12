import { useContext, useEffect, useState } from "react";
import { Button } from "@chakra-ui/button";
import { ButtonGroup } from "@chakra-ui/button";
import dynamic from "next/dynamic";
//doesn't have a commonjs export so Next can't load it on SSR,
//so we load it dynamically on the client
const Chart = dynamic(
  () => import("kaktana-react-lightweight-charts").then((Chart) => Chart),
  { ssr: false }
);
import theme from "../../theme";
import useFetch from "../../hooks/useFetch";
import { CircularProgress } from "@chakra-ui/progress";
import { Flex } from "@chakra-ui/layout";
import { DexesContext } from "../../providers/dexes";
import { filterObj } from "../../utils/filterObj";
import { useColorModeValue } from "@chakra-ui/color-mode";

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
  {
    name: "Transactions",
    yAxisKey: {
      daily: "txDiff",
      weekly: "txDiff",
    },
  },
];

const aggregationUnits = ["daily", "weekly"];

export default function Charts() {
  const { response, loading, error } = useFetch("api/chartData");
  const { dexes } = useContext(DexesContext);

  const [chartId, setChartId] = useState(0);
  const [selectedView, setSelectedView] = useState(0);
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  const bg = useColorModeValue(theme.colors.gray[100], theme.colors.gray[700]);
  const color = useColorModeValue(
    theme.colors.gray[900],
    theme.colors.gray[100]
  );
  const grid = useColorModeValue(
    theme.colors.gray[200],
    theme.colors.gray[600]
  );
  useEffect(() => {
    setChartOptions({
      layout: {
        backgroundColor: bg,
        textColor: color,
      },
      grid: {
        vertLines: {
          color: grid,
        },
        horzLines: {
          color: grid,
        },
      },
    });
  }, [bg, color, grid]);

  useEffect(() => {
    if (!response) return;
    const selectedDexes = filterObj(dexes, (k, v) => v.active);
    setChartData(
      Object.entries(selectedDexes).map(([key, { label }]) => ({
        legend: label,
        title: label,
        data: response[key][aggregationUnits[selectedUnit] + "Data"].map(
          (obj, i) => ({
            time: obj.date,
            value: obj[
              charts[selectedView].yAxisKey[aggregationUnits[selectedUnit]]
            ]?.toFixed(2),
          })
        ),
        options: {
          color: theme.colors[key][500],
          lastValueVisible: false,
          priceFormat: {
            type: "volume",
            precision: 2,
          },
        },
      }))
    );
    setChartId((chartId) => chartId + 1);
  }, [response, selectedUnit, selectedView, dexes]);

  return (
    <>
      <ChartNavbar
        selectedView={selectedView}
        setSelectedView={setSelectedView}
        selectedUnit={selectedUnit}
        setSelectedUnit={setSelectedUnit}
      />
      <Flex
        w="100%"
        h="400px"
        position="relative"
        alignItems="center"
        justifyContent="center"
        id="chartWrapper"
      >
        {loading ? (
          <CircularProgress
            isIndeterminate
            position="absolute"
            color="gray.600"
          />
        ) : (
          <Chart
            key={chartId}
            lineSeries={chartData}
            options={chartOptions}
            autoHeight
            autoWidth
          />
        )}
      </Flex>
    </>
  );
}

function ChartNavbar({
  selectedView,
  setSelectedView,
  selectedUnit,
  setSelectedUnit,
}) {
  const bg = useColorModeValue(theme.colors.gray[300], theme.colors.gray[600]);

  return (
    <Flex justifyContent="space-between">
      <ButtonGroup spacing={2} pb={8}>
        {charts.map(({ name }, i) => (
          <Button
            key={i}
            bg={selectedView === i ? bg : ""}
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
            bg={selectedUnit === i ? bg : ""}
            onClick={() => setSelectedUnit(i)}
          >
            {unit}
          </Button>
        ))}
      </ButtonGroup>
    </Flex>
  );
}
