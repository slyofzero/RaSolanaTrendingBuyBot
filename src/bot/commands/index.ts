import { teleBot } from "@/index";
import { log } from "@/utils/handlers";
import { setEmojis } from "./setEmojis";
import { executeStep } from "../executeStep";

export function initiateBotCommands() {
  teleBot.command("setEmoji", (ctx) => setEmojis(ctx));

  // @ts-expect-error Type not found
  teleBot.on(["message"], (ctx) => executeStep(ctx));

  log("Bot commands up");
}
