const { ApolloClient } = require('apollo-client')
const { InMemoryCache } = require('apollo-cache-inmemory')
const { HttpLink } = require('apollo-link-http')
const fetch = require('node-fetch')

exports.uniClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

exports.sushiClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/sushiswap/sushiswap',
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

exports.honeyClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/1hive/uniswap-v2',
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

exports.ethBlockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
})

exports.xdaiBlockClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks',
    fetch: fetch,
  }),
  cache: new InMemoryCache()
})
