const { getBlockFromTimestamp, get2DayPercentChange, getPercentChange } = require('./utils.js')
const { GLOBAL_DATA, GET_BLOCK, GLOBAL_CHART } = require('../apollo/queries.js')


const dayjs = require('dayjs')
const utc = require('dayjs/plugin/utc')
const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(utc)
dayjs.extend(weekOfYear)

exports.getGlobalData = async function getGlobalData(protocolClient, blockClient) {

  let data = {}
  let oneDayData = {}
  let twoDayData = {}

  try {
    const utcCurrentTime = dayjs()
    const utcOneDayBack = utcCurrentTime.subtract(1, 'day').unix()
    const utcTwoDaysBack = utcCurrentTime.subtract(2, 'day').unix()
    const utcOneWeekBack = utcCurrentTime.subtract(1, 'week').unix()
    const utcTwoWeeksBack = utcCurrentTime.subtract(2, 'week').unix()

    const oneDayBlock = await getBlockFromTimestamp(utcOneDayBack, blockClient)
    const twoDayBlock = await getBlockFromTimestamp(utcTwoDaysBack, blockClient)
    const oneWeekBlock = await getBlockFromTimestamp(utcOneWeekBack, blockClient)
    const twoWeekBlock = await getBlockFromTimestamp(utcTwoWeeksBack, blockClient)

    // fetch the global data
    let result = await protocolClient.query({
      query: GLOBAL_DATA(),
      fetchPolicy: 'cache-first',
    })
    data = result.data.uniswapFactories[0]

    // fetch the historical data
    let oneDayResult = await protocolClient.query({
      query: GLOBAL_DATA(oneDayBlock),
      fetchPolicy: 'cache-first',
    })
    oneDayData = oneDayResult.data.uniswapFactories[0]

    let twoDayResult = await protocolClient.query({
      query: GLOBAL_DATA(twoDayBlock),
      fetchPolicy: 'cache-first',
    })
    twoDayData = twoDayResult.data.uniswapFactories[0]

    let oneWeekResult = await protocolClient.query({
      query: GLOBAL_DATA(oneWeekBlock),
      fetchPolicy: 'cache-first',
    })
    const oneWeekData = oneWeekResult.data.uniswapFactories[0]

    let twoWeekResult = await protocolClient.query({
      query: GLOBAL_DATA(twoWeekBlock),
      fetchPolicy: 'cache-first',
    })
    const twoWeekData = twoWeekResult.data.uniswapFactories[0]

    if (data && oneDayData && twoDayData && twoWeekData) {
      let [oneDayVolume, dailyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneDayData.totalVolumeUSD ? oneDayData.totalVolumeUSD : 0,
        twoDayData.totalVolumeUSD ? twoDayData.totalVolumeUSD : 0
      )

      const [oneWeekVolume, weeklyVolumeChange] = get2DayPercentChange(
        data.totalVolumeUSD,
        oneWeekData.totalVolumeUSD ? oneWeekData.totalVolumeUSD : 0,
        twoWeekData.totalVolumeUSD ? twoWeekData.totalVolumeUSD : 0
      )

      const [oneDayTxns, dailyTxnChange] = get2DayPercentChange(
        data.txCount,
        oneDayData.txCount ? oneDayData.txCount : 0,
        twoDayData.txCount ? twoDayData.txCount : 0
      )

      const [oneWeekTxns, weeklyTxnChange] = get2DayPercentChange(
        data.txCount,
        oneWeekData.txCount ? oneWeekData.txCount : 0,
        twoWeekData.txCount ? twoWeekData.txCount : 0
      )

      // add relevant fields with the calculated amounts
      var globalData = {
        oneDayVolume,
        dailyVolumeChange,
        oneWeekVolume,
        weeklyVolumeChange,
        oneDayTxns,
        dailyTxnChange,
        oneWeekTxns,
        weeklyTxnChange,
        oneDayFee: oneDayVolume * 0.03,
        oneWeekFee: oneWeekVolume * 0.03
      }
    }
  } catch (e) {
    console.log(e)
  }
  return globalData
}

exports.getChartData = async function getChartData(oldestDateToFetch, client) {
  let data = []
  let weeklyData = []
  const utcEndTime = dayjs.utc()
  let skip = 0
  let allFound = false

  try {
    while (!allFound) {
      let result = await client.query({
        query: GLOBAL_CHART,
        variables: {
          startTime: oldestDateToFetch,
          skip,
        },
        fetchPolicy: 'cache-first',
      })
      skip += 1000
      data = data.concat(result.data.uniswapDayDatas)
      if (result.data.uniswapDayDatas.length < 1000) {
        allFound = true
      }
    }

    if (data) {
      let dayIndexSet = new Set()
      let dayIndexArray = []
      const oneDay = 24 * 60 * 60

      // for each day, parse the daily volume and format for chart array
      data.forEach((dayData, i) => {
        // add the day index to the set of days
        dayIndexSet.add((data[i].date / oneDay).toFixed(0))
        dayIndexArray.push(data[i])
        dayData.dailyVolumeUSD = parseFloat(dayData.dailyVolumeUSD)
        dayData.totalLiquidityUSD = parseFloat(dayData.totalLiquidityUSD)
        dayData.txCount = parseInt(dayData.txCount)
        dayData.txFee = dayData.dailyVolumeUSD * 0.03
      })

      // fill in empty days ( there will be no day datas if no trades made that day )
      let timestamp = data[0].date ? data[0].date : oldestDateToFetch
      let latestLiquidityUSD = data[0].totalLiquidityUSD
      let latestDayDats = data[0].mostLiquidTokens
      let index = 1
      while (timestamp < utcEndTime.unix() - oneDay) {
        const nextDay = timestamp + oneDay
        let currentDayIndex = (nextDay / oneDay).toFixed(0)
        if (!dayIndexSet.has(currentDayIndex)) {
          data.push({
            date: nextDay,
            dailyVolumeUSD: 0,
            totalLiquidityUSD: latestLiquidityUSD,
            mostLiquidTokens: latestDayDats,
          })
        } else {
          latestLiquidityUSD = dayIndexArray[index].totalLiquidityUSD
          latestDayDats = dayIndexArray[index].mostLiquidTokens
          index = index + 1
        }
        timestamp = nextDay
      }
    }

    // format weekly data for weekly sized chunks
    data = data.sort((a, b) => (parseInt(a.date) > parseInt(b.date) ? 1 : -1))
    let startIndexWeekly = -1
    let currentWeek = -1
    data.forEach((entry, i) => {
      const week = dayjs.utc(dayjs.unix(data[i].date)).week()
      if (week !== currentWeek) {
        currentWeek = week
        startIndexWeekly++
      }
      weeklyData[startIndexWeekly] = weeklyData[startIndexWeekly] || {}
      weeklyData[startIndexWeekly].date = data[i].date
      weeklyData[startIndexWeekly].weeklyVolumeUSD =
        (weeklyData[startIndexWeekly].weeklyVolumeUSD ?? 0) + data[i].dailyVolumeUSD
      weeklyData[startIndexWeekly].weeklyAvgLiquidityUSD =
        (weeklyData[startIndexWeekly].weeklyAvgLiquidityUSD ?? 0) + (data[i].totalLiquidityUSD / 7)
    })
  } catch (e) {
    console.log(e)
  }
  return {dailyData: data, weeklyData}
}
