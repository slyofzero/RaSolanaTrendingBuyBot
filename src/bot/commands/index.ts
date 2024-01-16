import { teleBot } from "@/index";
import { startBot } from "./start";
import { log } from "@/utils/handlers";

export function initiateBotCommands() {
  teleBot.api.setMyCommands([{ command: "start", description: "Start the bot" }]);
  teleBot.command("start", (ctx) => startBot(ctx));

  log("Bot commands up");
}
