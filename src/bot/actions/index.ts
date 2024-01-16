import { teleBot } from "@/index";
import { log } from "@/utils/handlers";
import { setEmojiCallback } from "./setEmoji";

export function initiateCallbackQueries() {
  teleBot.callbackQuery("set-emoji", (ctx) => setEmojiCallback(ctx));

  log("Bot callback queries up");
}
