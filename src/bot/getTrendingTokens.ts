import { getDocument } from "@/firebase";
import { TrendingTokensInfo } from "@/types/trendTokens";
import { apiFetcher } from "@/utils/api";
import { TRENDING_TOKENS_API } from "@/utils/env";
import { log } from "@/utils/handlers";
import { sleep } from "@/utils/time";
import { scanToken } from "./scanToken";
import { StoredTrending } from "@/types/firebase/trending";
import { setTrendingTokens } from "@/vars/trendingTokens";

export async function getTrendingTokens() {
  log("Getting trending pairs data");

  const { data: tokensData } = (
    await apiFetcher<TrendingTokensInfo>(
      `${TRENDING_TOKENS_API}/analytics/preview/trending?limit=20`
    )
  ).data;

  const trendingTokens: string[] = [];

  for (const token of tokensData) {
    if (trendingTokens.length === 10) break;

    const { address } = token;
    const tokenInfo = await scanToken(address);
    if (!tokenInfo) continue;
    trendingTokens.push(address);

    await sleep(1000);
  }

  const storedTrending = (await getDocument({
    collectionName: "to_trend",
    queries: [["status", "in", ["PAID", "MANUAL"]]],
  })) as StoredTrending[];

  for (const { token, rank } of storedTrending) {
    if (trendingTokens.includes(token)) {
      const indexOf = trendingTokens.findIndex((address) => address === token);
      const indexItem = trendingTokens.splice(indexOf, 1).at(0);

      if (indexItem) {
        trendingTokens.splice(rank - 1, 0, indexItem);
        log(`Added ${token} to rank ${rank}`);
      }
    } else {
      const tokenInfo = await scanToken(token);

      if (tokenInfo) {
        trendingTokens.splice(rank - 1, 0, token);
        log(`Untrending ${token} added to rank ${rank}`);
      }
    }
  }

  setTrendingTokens(trendingTokens);
}
