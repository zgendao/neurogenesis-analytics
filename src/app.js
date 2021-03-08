const axios = require("axios")
const express = require('express')
const app = express()
const port = 4444

const {
  uniClient,
  shushiClient,
  mdexClient,
  pancakeClient,
  honeyClient,
  ethBlockClient,
  bscBlockClient,
  hecoBlockClient,
  xdaiBlockClient } = require('../apollo/clients.js')
const { GLOBAL_DATA, GET_BLOCK } = require('../apollo/queries.js')
const { getBlockFromTimestamp, get2DayPercentChange, getPercentChange } = require('./utils.js')
const { getGlobalData, getChartData, getGasPrice } = require('./methods.js');

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

async function getSummary(){
  const [uni, sushi, pancake, mdex, honey] = await Promise.all([
    getGlobalData(uniClient, ethBlockClient),
    getGlobalData(shushiClient, ethBlockClient),
    getGlobalData(pancakeClient, bscBlockClient),
    getGlobalData(mdexClient, hecoBlockClient),
    getGlobalData(honeyClient, xdaiBlockClient)
  ])
  return {uni, sushi, pancake, mdex, honey}
}

app.get("/api/summary", (req, res) => {
  getSummary().then(summary => res.send(summary))
});

async function getAggregatedChartData(oldestDateToFetch) {
  const [uni, sushi, pancake, mdex, honey] = await Promise.all([
    getChartData(uniClient, oldestDateToFetch),
    getChartData(shushiClient, oldestDateToFetch),
    getChartData(pancakeClient, oldestDateToFetch),
    getChartData(mdexClient, oldestDateToFetch),
    getChartData(honeyClient, oldestDateToFetch)
  ])
  return {uni, sushi, pancake, mdex, honey}
}

app.get("/api/chartData", (req, res) => {
  const oldestDateToFetch = 1593561600 //JULY FIRST
  getAggregatedChartData(oldestDateToFetch).then(data => res.send(data))
});

app.get("/api/gasPrice", (req, res) => {
  getGasPrice().then(gasPrice => res.send(gasPrice))
});
