// gas https://studio.glassnode.com/pricing https://web3py.readthedocs.io/en/stable/gas_price.html
// pancakeswap https://github.com/pancakeswap/pancake-info-api

const axios = require("axios")
const express = require('express')
const app = express()
const port = 3000

const { uniClient, honeyClient, ethBlockClient, xdaiBlockClient } = require('../apollo/clients.js')
const { GLOBAL_DATA, GET_BLOCK } = require('../apollo/queries.js')
const { getBlockFromTimestamp, get2DayPercentChange, getPercentChange } = require('./utils.js')
const { getGlobalData, getChartData } = require('./methods.js');

async function getData(){
  const retrospectiveDate = 1593561600 //JULY FIRST

  const uniMainData = await getGlobalData(uniClient, ethBlockClient)
  const uniChartData = await getChartData(retrospectiveDate, uniClient)

  const honeyMainData = await getGlobalData(honeyClient, xdaiBlockClient)
  const honeyChartData = await getChartData(retrospectiveDate, honeyClient)

  const data = {
    uniMainData,
    uniChartData,
    honeyMainData,
    honeyChartData
  }

  return data
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.get('/', (req, res) => {
  getData().then(data => res.send({data}))
})
