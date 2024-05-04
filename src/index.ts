import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log, stopScript } from "./utils/handlers";
import {
  BOT_TOKEN,
  HTTP_CLIENT,
  TONCLIENT_API_KEY,
  TONCLIENT_ENDPOINT,
  TON_API_KEY,
} from "./utils/env";
import { Api, HttpClient } from "tonapi-sdk-js";
import { TonClient } from "@ton/ton";
import { subscribeAccount } from "./tonWeb3";
import { syncTrendingTokens } from "./vars/trendingTokens";
import { syncToTrend } from "./vars/trending";
import { syncAdvertisements } from "./vars/advertisements";
import { syncProjectGroups } from "./vars/projectGroups";
import { rpcConfig } from "./rpc";
// import { dedustTransfer } from "./tonWeb3/transferTxn";

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

  subscribeAccount();

  // const txn = await client.blockchain.getBlockchainTransaction(
  //   "839fbf5b634333e7b3ae2cd22a9544bb9f3d7743f35928e1a677fa2de6693efd"
  // );
  // const outMsg = txn.out_msgs.find(
  //   ({ decoded_op_name }) => decoded_op_name?.trim() === "dedust_swap"
  // );
  // if (outMsg) dedustTransfer(txn, outMsg);

  // Server
})();
