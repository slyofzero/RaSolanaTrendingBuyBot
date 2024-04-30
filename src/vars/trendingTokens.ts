import { apiFetcher } from "@/utils/api";
import { TRENDING_AUTH_KEY, TRENDING_TOKENS_API } from "@/utils/env";
import { log } from "@/utils/handlers";

type TrendingTokens = string[];

export let trendingTokens: TrendingTokens = [];

export async function syncTrendingTokens() {
  if (!TRENDING_TOKENS_API) {
    return log(`TRENDING_TOKENS_API is undefined`);
  }

  log(`Getting trending pairs data, got ${trendingTokens.length} tokens`);

  const { trendingTokens: newTrendingTokens } = (
    await apiFetcher(TRENDING_TOKENS_API || "", {
      Authorization: TRENDING_AUTH_KEY || "",
    })
  ).data as { trendingTokens: TrendingTokens };

  trendingTokens = newTrendingTokens;
}
