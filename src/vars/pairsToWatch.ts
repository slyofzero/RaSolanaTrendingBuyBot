import { log } from "@/utils/handlers";
import { trendingTokens } from "./trending";
import { projectGroups } from "./projectGroups";
import { currentWSS, setUpWSS } from "@/setupWSS";
import { memoizeTokenData, memoTokenData } from "./tokens";
import { teleBot } from "..";
import { LOGS_CHANNEL_ID } from "@/utils/env";

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

  let memoizedTokenLog = Object.values(memoTokenData)
    .map(({ baseToken }) => {
      const { name, symbol } = baseToken;
      return `${symbol} | ${name}`;
    })
    .join("\n");

  memoizedTokenLog = `Tokens currently being watched - ${memoTokenData}`;
  teleBot.api.sendMessage(LOGS_CHANNEL_ID || "", memoizedTokenLog);

  setUpWSS(pairsToWatch);
  log(`Synced all pairs to watch`);
}
