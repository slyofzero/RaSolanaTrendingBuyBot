import { Address } from "@ton/ton";

export let trendingTokens: { [key: string]: number } = {};
export function setTrendingTokens(tokens: string[]) {
  trendingTokens = {};
  for (const [index, token] of tokens.entries()) {
    const rawToken = Address.parse(token).toRawString();
    trendingTokens[rawToken] = index + 1;
  }
}
