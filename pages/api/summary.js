import {
  uniClient,
  sushiClient,
  mdexClient,
  honeyClient,
  ethBlockClient,
  hecoBlockClient,
  xdaiBlockClient,
} from "../../apollo/clients.js";
import { GLOBAL_DATA, GET_BLOCK } from "../../apollo/queries.js";
import axios from "axios";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export default async (req, res) => {
  const sum = await getSummary();
  res.status(200).json(sum);
};

async function getSummary() {
  const [uni, sushi, pancake, mdex, honey] = await Promise.all([
    getGlobalData(uniClient, ethBlockClient),
    getGlobalData(sushiClient, ethBlockClient),
    getPancakeMainData(),
    getGlobalData(mdexClient, hecoBlockClient),
    getGlobalData(honeyClient, xdaiBlockClient),
  ]);
  return { uni, sushi, pancake, mdex, honey };
}

async function getGlobalData(protocolClient, blockClient) {
  let data = {};
  let oneDayData = {};
  let twoDayData = {};

  try {
    const utcCurrentTime = dayjs();
    const utcOneDayBack = utcCurrentTime.subtract(1, "day").unix();
    const utcTwoDaysBack = utcCurrentTime.subtract(2, "day").unix();
    const utcOneWeekBack = utcCurrentTime.subtract(1, "week").unix();
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, "week").unix();

    const [
      oneDayBlock,
      twoDayBlock,
      oneWeekBlock,
      twoWeekBlock,
    ] = await Promise.all([
      getBlockFromTimestamp(utcOneDayBack, blockClient),
      getBlockFromTimestamp(utcTwoDaysBack, blockClient),
      getBlockFromTimestamp(utcOneWeekBack, blockClient),
      getBlockFromTimestamp(utcTwoWeeksBack, blockClient),
    ]);

    // const [
    //   {
    //     data: {
    //       uniswapFactories: [data],
    //     },
    //   },
    //   {
    //     data: {
    //       uniswapFactories: [oneDayData],
    //     },
    //   },
    //   {
    //     data: {
    //       uniswapFactories: [twoDayData],
    //     },
    //   },
    //   {
    //     data: {
    //       uniswapFactories: [oneWeekData],
    //     },
    //   },
    //   {
    //     data: {
    //       uniswapFactories: [twoWeekData],
    //     },
    //   },
    // ] = await Promise.all([
    //   protocolClient.query({
    //     query: GLOBAL_DATA(),
    //     fetchPolicy: "cache-first",
    //   }),
    //   protocolClient.query({
    //     query: GLOBAL_DATA(oneDayBlock),
    //     fetchPolicy: "cache-first",
    //   }),
    //   protocolClient.query({
    //     query: GLOBAL_DATA(twoDayBlock),
    //     fetchPolicy: "cache-first",
    //   }),
    //   protocolClient.query({
    //     query: GLOBAL_DATA(oneWeekBlock),
    //     fetchPolicy: "cache-first",
    //   }),
    //   protocolClient.query({
    //     query: GLOBAL_DATA(twoWeekBlock),
    //     fetchPolicy: "cache-first",
    //   }),
    // ]);

    let result = await protocolClient.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first',
    })
    data = result.data.uniswapFactories[0]

    // fetch the historical data
    let oneDayResult = await protocolClient.query({
      query: GLOBAL_DATA(oneDayBlock?.number),
      fetchPolicy: 'cache-first',
    })
    oneDayData = oneDayResult.data.uniswapFactories[0]

    let twoDayResult = await protocolClient.query({
      query: GLOBAL_DATA(twoDayBlock?.number),
      fetchPolicy: 'cache-first',
    })
    twoDayData = twoDayResult.data.uniswapFactories[0]

    let oneWeekResult = await protocolClient.query({
      query: GLOBAL_DATA(oneWeekBlock?.number),
      fetchPolicy: 'cache-first',
    })
    const oneWeekData = oneWeekResult.data.uniswapFactories[0]

    let twoWeekResult = await protocolClient.query({
      query: GLOBAL_DATA(twoWeekBlock?.number),
      fetchPolicy: 'cache-first',
    })
    const twoWeekData = twoWeekResult.data.uniswapFactories[0]

    if (data && oneDayData && twoDayData && twoWeekData) {
      let [oneDayVolume, dailyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
        twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0
      );

      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneWeekData.totalVolumeUSD ? oneWeekData.totalVolumeUSD : 0,
        twoWeekData.totalVolumeUSD ? twoWeekData.totalVolumeUSD : 0
      );

      const [oneDayTxns, dailyTxnChange] = get2DayPercentChange(
        data.txCount,
        oneDayData.txCount ? oneDayData.txCount : 0,
        twoDayData.txCount ? twoDayData.txCount : 0
      );

      const [oneWeekTxns, weeklyTxnChange] = get2DayPercentChange(
        data.txCount,
        oneWeekData.txCount ? oneWeekData.txCount : 0,
        twoWeekData.txCount ? twoWeekData.txCount : 0
      );

      // add relevant fields with the calculated amounts
      var globalData = {
        totalLiquidity: parseFloat(data.totalLiquidityUSD),
        oneDayVolume,
        dailyVolumeChange,
        oneWeekVolume,
        weeklyVolumeChange,
        oneDayTxns,
        dailyTxnChange,
        oneWeekTxns,
        weeklyTxnChange,
        oneDayFee: oneDayVolume * 0.03,
        oneWeekFee: oneWeekVolume * 0.03,
        pairCount: data.pairCount,
      };
    }
  } catch (e) {
    console.log(e);
  }
  return globalData;
}

async function getPancakeMainData() {
  const { data } = await axios.get(
    "https://api.pancakeswap.finance/api/v1/stat"
  );
  return {
    oneDayVolume: data["24h_total_volume"],
    oneDayFee: data["24h_total_volume"] * 0.03,
    totalLiquidity: data["total_value_locked"],
    dailyVolumeChange: 0,
  };
}

async function getBlockFromTimestamp(timestamp, client) {
  let result = await client.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
    fetchPolicy: "cache-first",
  });
  return result?.data?.blocks?.[0]?.number;
}

function get2DayPercentChange(valueNow, value24HoursAgo, value48HoursAgo) {
  // get volume info for both 24 hour periods
  let currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
  let previousChange =
    parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo);

  const adjustedPercentChange =
    (parseFloat(currentChange - previousChange) / parseFloat(previousChange)) *
    100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
}
