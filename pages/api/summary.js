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
  /* const [uni, sushi, pancake, mdex, honey] = await Promise.all([
    getGlobalData(uniClient, ethBlockClient),
    getGlobalData(sushiClient, ethBlockClient),
    getPancakeMainData(),
    getGlobalData(mdexClient, hecoBlockClient),
    getGlobalData(honeyClient, xdaiBlockClient),
  ]); */
  const data = {
    uni: {
      totalLiquidity: 4696465669.780892,
      oneDayVolume: 1157467917.1260529,
      dailyVolumeChange: 28.767827358020483,
      oneWeekVolume: 7099636866.570435,
      weeklyVolumeChange: 17.894267080037615,
      oneDayTxns: 169309,
      dailyTxnChange: 6.837083685651906,
      oneWeekTxns: 1158084,
      weeklyTxnChange: 17.801243638634784,
      oneDayFee: 34724037.513781585,
      oneWeekFee: 212989105.99711302,
      pairCount: 30815,
    },
    sushi: {
      totalLiquidity: 4072477191.832629,
      oneDayVolume: 297567653.2150955,
      dailyVolumeChange: 13.641229182975101,
      oneWeekVolume: 2151727445.8943176,
      weeklyVolumeChange: -25.986201704355683,
      oneDayTxns: 11984,
      dailyTxnChange: 10.288974783729063,
      oneWeekTxns: 89878,
      weeklyTxnChange: -22.844879388788737,
      oneDayFee: 8927029.596452866,
      oneWeekFee: 64551823.37682953,
      pairCount: 814,
    },
    pancake: {
      oneDayVolume: 1974124930.5912623,
      oneDayFee: 59223747.91773787,
      totalLiquidity: 2855003899.7511406,
      dailyVolumeChange: 0,
    },
    mdex: {
      totalLiquidity: 1911571209.9980254,
      oneDayVolume: 2056542492.12352,
      dailyVolumeChange: -6.985050244166477,
      oneWeekVolume: 16510064362.227554,
      weeklyVolumeChange: -18.68838226217828,
      oneDayTxns: 850604,
      dailyTxnChange: -8.150944455662469,
      oneWeekTxns: 7411676,
      weeklyTxnChange: -20.354718539087802,
      oneDayFee: 61696274.7637056,
      oneWeekFee: 495301930.8668266,
      pairCount: 2938,
    },
    honey: {
      totalLiquidity: 10289257.687802982,
      oneDayVolume: 19941569.36917062,
      dailyVolumeChange: 706.5249499695356,
      oneWeekVolume: 39933658.15462533,
      weeklyVolumeChange: 57.846654020947,
      oneDayTxns: 58215,
      dailyTxnChange: 174.4954734062618,
      oneWeekTxns: 208976,
      weeklyTxnChange: 23.019685410191205,
      oneDayFee: 598247.0810751186,
      oneWeekFee: 1198009.7446387596,
      pairCount: 875,
    },
  };
  function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }
  //return { uni, sushi, pancake, mdex, honey };
  await wait(2000);
  return data;
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

    const [
      {
        data: {
          uniswapFactories: [data],
        },
      },
      {
        data: {
          uniswapFactories: [oneDayData],
        },
      },
      {
        data: {
          uniswapFactories: [twoDayData],
        },
      },
      {
        data: {
          uniswapFactories: [oneWeekData],
        },
      },
      {
        data: {
          uniswapFactories: [twoWeekData],
        },
      },
    ] = await Promise.all([
      protocolClient.query({
        query: GLOBAL_DATA(),
        fetchPolicy: "cache-first",
      }),
      protocolClient.query({
        query: GLOBAL_DATA(oneDayBlock),
        fetchPolicy: "cache-first",
      }),
      protocolClient.query({
        query: GLOBAL_DATA(twoDayBlock),
        fetchPolicy: "cache-first",
      }),
      protocolClient.query({
        query: GLOBAL_DATA(oneWeekBlock),
        fetchPolicy: "cache-first",
      }),
      protocolClient.query({
        query: GLOBAL_DATA(twoWeekBlock),
        fetchPolicy: "cache-first",
      }),
    ]);

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
