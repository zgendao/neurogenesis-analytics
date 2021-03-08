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
  const [uni, sushi, mdex, honey] = await Promise.all([
    getGlobalData(uniClient, ethBlockClient),
    getGlobalData(shushiClient, ethBlockClient),
    //getGlobalData(pancakeClient, bscBlockClient),
    getGlobalData(mdexClient, hecoBlockClient),
    getGlobalData(honeyClient, xdaiBlockClient)
  ])
  return {uni, sushi, mdex, honey}
}

app.get("/api/summary", async (req, res) => {
  const sum = await getSummary()
  res.send(sum)
});

async function getAggregatedChartData(oldestDateToFetch = 1593561600) { //JULY FIRST
  const [uni, sushi, pancake, mdex, honey] = await Promise.all([
    getChartData(uniClient, oldestDateToFetch),
    getChartData(shushiClient, oldestDateToFetch),
    getChartData(pancakeClient, oldestDateToFetch),
    getChartData(mdexClient, oldestDateToFetch),
    getChartData(honeyClient, oldestDateToFetch)
  ])
}

app.get("/api/chartData", (req, res) => {
  getAggregatedChartData().then(data => res.send(data))
});

app.get("/api/gasPrice", (req, res) => {
  getGasPrice().then(gasPrice => res.send(gasPrice))
});
