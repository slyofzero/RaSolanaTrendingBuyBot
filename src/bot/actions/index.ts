import { teleBot } from "@/index";
import { log } from "@/utils/handlers";
import { setEmojiCallback } from "./setEmoji";
import { settingsMainMenu } from "./settingMainMenu";
import { setGifCallback } from "./setGifCallback";

export function initiateCallbackQueries() {
  teleBot.callbackQuery("settings-main-menu", (ctx) => settingsMainMenu(ctx));
  teleBot.callbackQuery("set-emoji", (ctx) => setEmojiCallback(ctx));
  teleBot.callbackQuery("set-gif", (ctx) => setGifCallback(ctx));

  log("Bot callback queries up");
}
