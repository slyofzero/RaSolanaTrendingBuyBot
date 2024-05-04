import { teleBot } from "@/index";
import { log } from "@/utils/handlers";
import { setEmojiCallback } from "./setEmojiCallback";
import { settingsMainMenu } from "./settingMainMenu";
import { setGifCallback } from "./setGifCallback";
import { removeEmojiCallback } from "./removeEmoji";
import { removeGifCallback } from "./removeGif";
import { executeStep } from "../executeStep";

export function initiateCallbackQueries() {
  teleBot.callbackQuery("settings-main-menu", (ctx) => settingsMainMenu(ctx));
  teleBot.callbackQuery("set-emoji", (ctx) => setEmojiCallback(ctx));
  teleBot.callbackQuery("set-gif", (ctx) => setGifCallback(ctx));

  teleBot.callbackQuery("remove-emoji", (ctx) => removeEmojiCallback(ctx));
  teleBot.callbackQuery("confirm-remove-emoji", (ctx) =>
    removeEmojiCallback(ctx)
  );
  teleBot.callbackQuery("remove-gif", (ctx) => removeGifCallback(ctx));
  teleBot.callbackQuery("confirm-remove-gif", (ctx) => removeGifCallback(ctx));

  // @ts-expect-error Weird type at hand
  teleBot.on("callback_query:data", (ctx) => executeStep(ctx));

  log("Bot callback queries up");
}
