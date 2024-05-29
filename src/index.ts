import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log, stopScript } from "./utils/handlers";
import { BOT_TOKEN, PORT } from "./utils/env";
import { syncTrendingTokens } from "./vars/trendingTokens";
import { syncToTrend } from "./vars/trending";
import { syncAdvertisements } from "./vars/advertisements";
import { syncProjectGroups } from "./vars/projectGroups";
import { rpcConfig } from "./rpc/config";
import { cleanUpExpired } from "./bot/cleanup";
import { unlockUnusedAccounts } from "./bot/cleanup/account";
import express from "express";
import { pairsToWatch, syncPairsToWatch } from "./vars/pairsToWatch";

if (!PORT) {
  log("PORT is undefined");
  process.exit(1);
}

const app = express();

if (!BOT_TOKEN) {
  stopScript("BOT_TOKEN is missing.");
}

export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

(async function () {
  rpcConfig();
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([
    syncTrendingTokens(),
    syncToTrend(),
    syncAdvertisements(),
    syncProjectGroups(),
  ]);
  // await syncPairsToWatch();
  // console.log(pairsToWatch);

  setInterval(unlockUnusedAccounts, 60 * 60 * 1e3);
  setInterval(cleanUpExpired, 60 * 1e3);

  app.use(express.json());

  app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
  });
})();
