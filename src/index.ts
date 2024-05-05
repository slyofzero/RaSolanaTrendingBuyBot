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
import express, { Request, Response } from "express";
import { parseTxn } from "./bot/parseTxn";

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

  setInterval(unlockUnusedAccounts, 60 * 60 * 1e3);
  setInterval(cleanUpExpired, 60 * 1e3);

  app.use(express.json());

  app.get("/ping", (req: Request, res: Response) => {
    return res.status(200).json("Server setup properly");
  });

  app.post("/newTxn", (req: Request, res: Response) => {
    try {
      const txnData = req.body;
      parseTxn(txnData);
      return res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(400);
    }
  });

  app.listen(PORT, () => {
    log(`Server is running on port ${PORT}`);
  });

  // const txn = await client.blockchain.getBlockchainTransaction(
  //   "839fbf5b634333e7b3ae2cd22a9544bb9f3d7743f35928e1a677fa2de6693efd"
  // );
  // const outMsg = txn.out_msgs.find(
  //   ({ decoded_op_name }) => decoded_op_name?.trim() === "dedust_swap"
  // );
  // if (outMsg) dedustTransfer(txn, outMsg);

  // Server
})();
