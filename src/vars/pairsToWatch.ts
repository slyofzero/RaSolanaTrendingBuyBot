import { log } from "@/utils/handlers";
import { syncTrendingTokens, trendingTokens } from "./trending";
import { projectGroups, syncProjectGroups } from "./projectGroups";
import { syncToTrend } from "./toTrend";
import { setUpWSS } from "@/setupWSS";

export let pairsToWatch: string[] = [];
export let tokensToWatch: string[] = [];

export async function syncPairsToWatch() {
  await Promise.all([syncTrendingTokens(), syncToTrend(), syncProjectGroups()]);

  // Pairs
  pairsToWatch = Object.values(trendingTokens);
  projectGroups.forEach(({ pairs }) => {
    for (const pair of pairs) {
      if (!pairsToWatch.includes(pair)) pairsToWatch.push(pair);
    }
  });

  // Tokens
  tokensToWatch = Object.keys(trendingTokens);
  projectGroups.forEach(({ token }) => {
    if (!tokensToWatch.includes(token)) pairsToWatch.push(token);
  });

  setUpWSS(pairsToWatch);

  log(`Synced all pairs to watch`);
}
