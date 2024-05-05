import { Bot } from "grammy";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";
import { log, stopScript } from "./utils/handlers";
import { BOT_TOKEN, HELIS_API_KEY, PORT } from "./utils/env";
import { syncTrendingTokens } from "./vars/trendingTokens";
import { syncToTrend } from "./vars/trending";
import { syncAdvertisements } from "./vars/advertisements";
import { syncProjectGroups } from "./vars/projectGroups";
import { rpcConfig } from "./rpc/config";
import { cleanUpExpired } from "./bot/cleanup";
import { unlockUnusedAccounts } from "./bot/cleanup/account";
import express, { Request, Response } from "express";
import { parseTxn } from "./bot/parseTxn";
import { Helius } from "helius-sdk";

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

export const helius = new Helius(HELIS_API_KEY || "");

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
})();

// import { TransactionType } from "helius-sdk";

// helius
//   .createWebhook({
//     accountAddresses: ["7tD14BqShsvrbAntNSv1ZxW5jmxAaAGjazcBPHCVT6fW"],
//     transactionTypes: [TransactionType.SWAP],
//     webhookURL: "https://webhook.site/c9a41dca-c092-47f8-873e-d92b7f59b3ad",
//   })
//   .then((hook) => {
//     console.log(hook);
//   });

// helius.getAllWebhooks().then((hooks) => {
//   console.log(hooks);
// });

// helius
//   .deleteWebhook("37a0749c-6a24-44c1-9250-f2976ea6304f")
//   .then((hook) => {
//     console.log(hook);
//   })
//   .then(() => {
//     helius.getAllWebhooks().then((hooks) => {
//       console.log(hooks);
//     });
//   });
