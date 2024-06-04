import { log } from "@/utils/handlers";
import { trendingTokens } from "./trending";
import { projectGroups } from "./projectGroups";
import { currentWSS, setUpWSS } from "@/setupWSS";
import { memoizeTokenData } from "./tokens";

export let pairsToWatch: string[] = [];
export let tokensToWatch: string[] = [];

export async function syncPairsToWatch() {
  pairsToWatch = Object.values(trendingTokens);
  tokensToWatch = Object.keys(trendingTokens);

  projectGroups.forEach(({ pairs, token }) => {
    for (const pair of pairs) {
      if (!pairsToWatch.includes(pair)) pairsToWatch.push(pair);
      if (!tokensToWatch.includes(token)) tokensToWatch.push(token);
    }
  });

  if (currentWSS) {
    log("Reset WSS");
    currentWSS.close(4200, "Reset WSS");
  }

  await memoizeTokenData(tokensToWatch);
  setUpWSS(pairsToWatch);
  log(`Synced all pairs to watch`);
}
