export type PairData = {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: Token;
  quoteToken: Token;
  priceNative: string;
  priceUsd: string;
  txns: TransactionData;
  volume: VolumeData;
  priceChange: PriceChangeData;
  liquidity: LiquidityData;
  fdv: number;
  pairCreatedAt: number;
  info: PairInfo;
  labels?: string[];
};

type Token = {
  address: string;
  name: string;
  symbol: string;
};

type TransactionData = {
  m5: TransactionCount;
  h1: TransactionCount;
  h6: TransactionCount;
  h24: TransactionCount;
};

type TransactionCount = {
  buys: number;
  sells: number;
};

type VolumeData = {
  h24: number;
  h6: number;
  h1: number;
  m5: number;
};

type PriceChangeData = {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
};

type LiquidityData = {
  usd: number;
  base: number;
  quote: number;
};

type PairInfo = {
  imageUrl: string;
  websites: Website[];
  socials: Social[];
};

type Website = {
  label: string;
  url: string;
};

type Social = {
  type: string;
  url: string;
};

export type PairsData = {
  schemaVersion: string;
  pairs: PairData[];
};
