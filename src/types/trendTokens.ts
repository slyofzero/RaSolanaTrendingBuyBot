interface Analytics {
  volume_24h: number;
  price_change_24h: number;
  price_change_1w: number;
  price_change_1m: number;
}

interface Stats {
  promoting_points: number;
  subscribes: number;
}

export interface TrendingTokenInfo {
  id: number;
  address: string;
  symbol: string;
  name: string;
  image: string;
  verified: number;
  decimals: number;
  dedust_swap_address: string;
  dedust_lp_address: string;
  is_scam: number;
  total_supply: number;
  mintable: number;
  owner_address: string;
  is_highrisk: number;
  url_if_community_verified: string;
  analytics: Analytics;
  stats: Stats;
  links: {
    id: number;
    name: string;
    url: string;
    type: string;
  }[];
}

export interface TrendingTokensInfo {
  total_pages: number;
  data: TrendingTokenInfo[];
}
