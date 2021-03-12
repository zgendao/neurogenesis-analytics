import {
  uniClient,
  sushiClient,
  mdexClient,
  pancakeClient,
  honeyClient,
} from "../../apollo/clients.js";
import { GLOBAL_CHART } from "../../apollo/queries.js";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
dayjs.extend(utc);
dayjs.extend(weekOfYear);

export default async (req, res) => {
  const data = await getAggregatedChartData();
  res.status(200).json(data);
};

function reduceMetric(exchanges, metric, date, interval) {
  return Object.entries(exchanges).reduce((acc, current) => {
    return (
      acc + (current[1][interval].find((el) => el.date == date)?.[metric] || 0)
    );
  }, 0);
}

function getTotal(exchanges) {
  var dailyData = [];
  for (var { date } of exchanges.uni.dailyData) {
    const dailyVolumeUSD = reduceMetric(
      exchanges,
      "dailyVolumeUSD",
      date,
      "dailyData"
    );
    dailyData.push({
      date,
      dailyVolumeUSD,
      totalLiquidityUSD: reduceMetric(
        exchanges,
        "totalLiquidityUSD",
        date,
        "dailyData"
      ),
      txCount: reduceMetric(exchanges, "txCount", date, "dailyData"),
      txFee: dailyVolumeUSD * 0.03,
    });
  }

  var weeklyData = [];
  for (var { date } of exchanges.uni.weeklyData) {
    const weeklyVolumeUSD = reduceMetric(
      exchanges,
      "weeklyVolumeUSD",
      date,
      "weeklyData"
    );
    weeklyData.push({
      date,
      weeklyVolumeUSD,
      weeklyAvgLiquidityUSD: reduceMetric(
        exchanges,
        "weeklyAvgLiquidityUSD",
        date,
        "weeklyData"
      ),
      txCount: reduceMetric(exchanges, "txCount", date, "weeklyData"),
      txFee: weeklyVolumeUSD * 0.03,
    });
  }

  return { dailyData, weeklyData };
}

async function getAggregatedChartData(oldestDateToFetch = 1593561600) {
  //JULY FIRST
  const [uni, sushi, pancake, mdex, honey] = await Promise.all([
    getChartData(uniClient, oldestDateToFetch),
    getChartData(sushiClient, oldestDateToFetch),
    getChartData(pancakeClient, oldestDateToFetch),
    getChartData(mdexClient, oldestDateToFetch),
    getChartData(honeyClient, oldestDateToFetch),
  ]);

  const total = getTotal({uni, sushi, pancake, mdex, honey});
  return {uni, sushi, pancake, mdex, honey, total};
}

async function getChartData(client, oldestDateToFetch) {
  let data = [];
  let weeklyData = [];
  const utcEndTime = dayjs.utc();
  let skip = 0;
  let allFound = false;

  try {
    while (!allFound) {
      let result = await client.query({
        query: GLOBAL_CHART,
        variables: {
          startTime: oldestDateToFetch,
          skip,
        },
        fetchPolicy: "cache-first",
      });
      skip += 1000;
      data = data.concat(result.data.uniswapDayDatas);
      if (result.data.uniswapDayDatas.length < 1000) {
        allFound = true;
      }
    }

    if (data) {
      let dayIndexSet = new Set();
      let dayIndexArray = [];
      const oneDay = 24 * 60 * 60;
      var prevTxCount = parseInt(data[0].txCount);

      // for each day, parse the daily volume and format for chart array
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0));
        dayIndexArray.push(data[i]);
        dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD);
        dayData.totalLiquidityUSD = parseFloat(dayData.totalLiquidityUSD);
        dayData.txFee = dayData.dailyVolumeUSD * 0.03;

        var currentTxCount = parseInt(dayData.txCount);
        dayData.txDiff = currentTxCount - prevTxCount;
        prevTxCount = parseInt(dayData.txCount);
      });

      // fill in empty days ( there will be no day datas if no trades made that day )
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch;
      let latestLiquidityUSD = data[0].totalLiquidityUSD;
      let latestDayDats = data[0].mostLiquidTokens;
      let index = 1;
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay;
        let currentDayIndex = (nextDay / oneDay).toFixed(0);
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats,
          });
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD;
          latestDayDats = dayIndexArray[index].mostLiquidTokens;
          index = index + 1;
        }
        timestamp = nextDay;
      }
    }

    // format weekly data for weekly sized chunks
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1));
    let startIndexWeekly = -1;
    let currentWeek = -1;
    data.forEach((entry, i) => {
      const week = dayjs.utc(dayjs.unix(data[i].date)).week();
      if (week !== currentWeek) {
        currentWeek = week;
        startIndexWeekly++;
      }
      weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {};
      weeklyData[startIndexWeekly].date = data[i].date;
      weeklyData[startIndexWeekly].weeklyVolumeUSD =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) +
        data[i].dailyVolumeUSD;
      weeklyData[startIndexWeekly].weeklyAvgLiquidityUSD =
        (weeklyData[startIndexWeekly].weeklyAvgLiquidityUSD ?? 0) +
        data[i].totalLiquidityUSD / 7;
      weeklyData[startIndexWeekly].txDiff =
        (weeklyData[startIndexWeekly].txDiff ?? 0) + data[i].txDiff;
      weeklyData[startIndexWeekly].txFee =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) * 0.03;
    });
  } catch (e) {
    console.log(e);
  }
  return { dailyData: data, weeklyData };
}
