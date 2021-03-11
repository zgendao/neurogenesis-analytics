import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import fetch from "node-fetch";

export const uniClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const sushiClient = new ApolloClient({
  link: new HttpLink({
    uri:
      "https://api.thegraph.com/subgraphs/name/zippoxer/sushiswap-subgraph-fork",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const mdexClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://graph.mdex.cc/subgraphs/name/mdex/swap",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const pancakeClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/pancakeswap/exchange",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const honeyClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/1hive/uniswap-v2",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
});

export const ethBlockClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
});

export const xdaiBlockClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
});

export const bscBlockClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.bscgraph.org/subgraphs/name/bsc-blocks",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
});

export const hecoBlockClient = new ApolloClient({
  link: new HttpLink({
    uri: "https://graph.mdex.cc/subgraphs/name/mdex-heco-blocks",
    fetch: fetch,
  }),
  cache: new InMemoryCache(),
});
