interface Token {
  address: string;
  name: string;
  symbol: string;
}

interface TransactionCounts {
  buys: number;
  sells: number;
}

interface TransactionData {
  m5: TransactionCounts;
  h1: TransactionCounts;
  h6: TransactionCounts;
  h24: TransactionCounts;
}

interface VolumeData {
  h24: number;
  h6: number;
  h1: number;
  m5: number;
}

interface PriceChangeData {
  m5: number;
  h1: number;
  h6: number;
  h24: number;
}

interface LiquidityData {
  usd: number;
  base: number;
  quote: number;
}

interface Social {
  type: string;
  url: string;
}

interface PairInfo {
  imageUrl: string;
  websites: string[];
  socials: Social[];
}

interface Pair {
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
}

export interface TokenData {
  schemaVersion: string;
  pairs: Pair[];
}
