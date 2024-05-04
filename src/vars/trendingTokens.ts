import { apiFetcher } from "@/utils/api";
import { TRENDING_AUTH_KEY, TRENDING_TOKENS_API } from "@/utils/env";
import { errorHandler, log } from "@/utils/handlers";

type TrendingTokens = string[];

export let trendingTokens: TrendingTokens = [];

export async function syncTrendingTokens() {
  try {
    if (!TRENDING_TOKENS_API) {
      return log(`TRENDING_TOKENS_API is undefined`);
    }

    const { trendingTokens: newTrendingTokens } = (
      await apiFetcher(TRENDING_TOKENS_API || "", {
        Authorization: TRENDING_AUTH_KEY || "",
      })
    ).data as { trendingTokens: TrendingTokens };

    trendingTokens = newTrendingTokens;
    log(`Getting trending pairs data, got ${trendingTokens.length} tokens`);
  } catch (error) {
    errorHandler(error);
    trendingTokens = [];
  }
}
