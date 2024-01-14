import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log, stopScript } from "./utils/handlers";
import { BOT_TOKEN, HTTP_CLIENT, TONCLIENT_ENDPOINT } from "./utils/env";
import { Api, HttpClient } from "tonapi-sdk-js";
import { TonClient } from "@ton/ton";
import { subscribeAccount } from "./tonWeb3";
import { checkNewTransfer } from "./vars/newTransfers";

if (!BOT_TOKEN) {
  stopScript("BOT_TOKEN is missing.");
}

if (!TONCLIENT_ENDPOINT) {
  stopScript("TONCLIENT_ENDPOINT is missing.");
}

const httpClient = new HttpClient({
  baseUrl: HTTP_CLIENT,
});
export const client = new Api(httpClient);
export const teleBot = new Bot(BOT_TOKEN || "");
export const tonClient = new TonClient({
  endpoint: TONCLIENT_ENDPOINT || "",
});
log("Bot instance ready");

// Check for new transfers at every 20 seconds
const interval = 20;

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();
  subscribeAccount();

  async function toRepeat() {
    await checkNewTransfer();
    setTimeout(toRepeat, interval * 1e3);
  }
  await toRepeat();
})();
