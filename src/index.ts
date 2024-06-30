import { Bot } from "grammy";
// import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log, stopScript } from "./utils/handlers";
import { BOT_TOKEN, PORT, TRENDING_BOT_TOKENS } from "./utils/env";
import { syncAdvertisements } from "./vars/advertisements";
import { rpcConfig } from "./rpc/config";
import express from "express";
import { syncTrendingTokens, trendingTokens } from "./vars/trending";
import { memoizeTokenData } from "./vars/tokens";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";

if (!PORT) {
  log("PORT is undefined");
  process.exit(1);
}

const app = express();

if (!BOT_TOKEN) {
  stopScript("BOT_TOKEN is missing.");
}

export const teleBot = new Bot(BOT_TOKEN || "");
export const trendingBuyAlertBots = TRENDING_BOT_TOKENS.map(
  (token) => new Bot(token)
);
log("Bot instance ready");

(async function () {
  rpcConfig();
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  await Promise.all([syncAdvertisements(), syncTrendingTokens()]);

  // setInterval(unlockUnusedAccounts, 60 * 60 * 1e3);
  setInterval(() => memoizeTokenData(Object.keys(trendingTokens)), 60 * 1e3);

  app.use(express.json());

  app.get("/ping", (req, res) => res.send({ message: "Server up" }));
  app.post("/syncTrending", () => {
    log(`Received sync request`);
    syncTrendingTokens();
  });

  app.post("/syncAds", () => {
    log(`Received sync request`);
    syncAdvertisements();
  });

  app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
  });
})();
