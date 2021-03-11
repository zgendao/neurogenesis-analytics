const gql = require("graphql-tag");

export const GLOBAL_DATA = (block) => {
  const queryString = ` query uniswapFactories {
      uniswapFactories${block ? `(block: { number: ${block}})` : ``}
       {
        id
        totalVolumeUSD
        totalLiquidityUSD
        txCount
        pairCount
      }
    }`;
  return gql(queryString);
};

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;

export const GLOBAL_CHART = gql`
  query uniswapDayDatas($startTime: Int!, $skip: Int!) {
    uniswapDayDatas(
      first: 1000
      skip: $skip
      where: { date_gt: $startTime }
      orderBy: date
      orderDirection: asc
    ) {
      id
      date
      dailyVolumeUSD
      totalLiquidityUSD
      txCount
    }
  }
`;
