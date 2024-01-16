import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";
import { settings } from "./settings";
import { setEmojiCommand } from "./setEmoji";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "settings", description: "To customize the bot" },
    { command: "set_emoji", description: "To set an emoji" },
  ]);
  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("settings", (ctx) => settings(ctx));
  teleBot.command("set_emoji", (ctx) => setEmojiCommand(ctx));

  log("Bot commands up");
}
