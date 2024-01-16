interface PriceChangePercentage {
  h1: string;
  h24: string;
}

interface Transactions {
  buys: number;
  sells: number;
  buyers: number;
  sellers: number;
}

interface VolumeUsd {
  h1: string;
  h24: string;
}

interface TokenAttributes {
  base_token_price_usd: string;
  base_token_price_native_currency: string;
  quote_token_price_usd: string;
  quote_token_price_native_currency: string;
  base_token_price_quote_token: string;
  quote_token_price_base_token: string;
  address: string;
  name: string;
  pool_created_at: string | null;
  fdv_usd: string;
  market_cap_usd: string | null;
  price_change_percentage: PriceChangePercentage;
  transactions: {
    h1: Transactions;
    h24: Transactions;
  };
  volume_usd: VolumeUsd;
  reserve_in_usd: string;
}

interface TokenRelationships {
  base_token: {
    data: {
      id: string;
      type: string;
    };
  };
  quote_token: {
    data: {
      id: string;
      type: string;
    };
  };
  dex: {
    data: {
      id: string;
      type: string;
    };
  };
}

interface TokenData {
  id: string;
  type: string;
  attributes: TokenAttributes;
  relationships: TokenRelationships;
}

export interface TokenPoolData {
  data: TokenData[];
}
