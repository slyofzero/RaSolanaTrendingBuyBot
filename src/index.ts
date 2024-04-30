import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log, stopScript } from "./utils/handlers";
import {
  BOT_TOKEN,
  HTTP_CLIENT,
  PORT,
  TONCLIENT_API_KEY,
  TONCLIENT_ENDPOINT,
  TON_API_KEY,
} from "./utils/env";
import { Api, HttpClient } from "tonapi-sdk-js";
import { TonClient } from "@ton/ton";
import { subscribeAccount } from "./tonWeb3";
import { checkNewTransfer } from "./vars/newTransfers";
import { syncTrendingTokens } from "./vars/trendingTokens";
import express, { Request, Response } from "express";
import { syncToTrend, toTrendTokens } from "./vars/trending";
import { advertisements, syncAdvertisements } from "./vars/advertisements";
import { syncProjectGroups } from "./vars/projectGroups";

if (!BOT_TOKEN) {
  stopScript("BOT_TOKEN is missing.");
}

if (!TONCLIENT_ENDPOINT) {
  stopScript("TONCLIENT_ENDPOINT is missing.");
}

if (!TONCLIENT_API_KEY) {
  stopScript("TONCLIENT_API_KEY is missing.");
}

const httpClient = new HttpClient({
  baseUrl: HTTP_CLIENT,
  baseApiParams: {
    headers: {
      Authorization: `Bearer ${TON_API_KEY}`,
      "Content-type": "application/json",
    },
  },
});
export const client = new Api(httpClient);
export const teleBot = new Bot(BOT_TOKEN || "");
export const tonClient = new TonClient({
  endpoint: TONCLIENT_ENDPOINT || "",
  apiKey: TONCLIENT_API_KEY || "",
});
log("Bot instance ready");

// Check for new transfers at every 20 seconds
const interval = 20;

const app = express();
log("Express server ready");

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();

  subscribeAccount();

  await Promise.all([
    syncTrendingTokens(),
    syncToTrend(),
    syncAdvertisements(),
    syncProjectGroups(),
  ]);

  async function repeatPerMinute() {
    await syncTrendingTokens();
    setTimeout(repeatPerMinute, 60 * 1e3);
  }
  await repeatPerMinute();

  async function toRepeat() {
    await checkNewTransfer();
    setTimeout(toRepeat, interval * 1e3);
  }
  await toRepeat();

  // Server
  app.use(express.json());

  app.get("/ping", (req: Request, res: Response) => {
    return res.json({ message: "Server is up" });
  });

  app.post("/syncTrending", async (req: Request, res: Response) => {
    await syncToTrend();
    return res.status(200).json({ toTrendTokens });
  });

  app.post("/syncAdvertisements", async (req: Request, res: Response) => {
    await syncAdvertisements();
    return res.status(200).json({ advertisements });
  });

  app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
  });
})();
