import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([
    { command: "start", description: "Start the bot" },
    { command: "set_emoji", description: "To set a custom emoji" },
  ]);
  teleBot.command("start", (ctx) => startBot(ctx));
  teleBot.command("set_emoji", (ctx) => startBot(ctx));

  log("Bot commands up");
}
