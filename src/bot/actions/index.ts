import { teleBot } from "@/index";
import { walletCallback } from "./wallet";
import { log } from "@/utils";

export function initiateCallbackQueries() {
  teleBot.callbackQuery("bot-action-wallet", (ctx) => walletCallback(ctx));

  log("Bot callback queries up");
}
