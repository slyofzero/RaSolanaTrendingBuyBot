import { Bot } from "grammy";
import { BOT_TOKEN, log, stopScript } from "@/utils";
import { initiateBotCommands, initiateCallbackQueries } from "./bot";

if (!BOT_TOKEN) {
  stopScript("BOT_TOKEN is missing.");
}
export const teleBot = new Bot(BOT_TOKEN || "");
log("Bot instance ready");

(async function () {
  teleBot.start();
  log("Telegram bot setup");
  initiateBotCommands();
  initiateCallbackQueries();
})();
