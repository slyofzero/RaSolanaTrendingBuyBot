import { CallbackQueryContext, CommandContext, Context } from "grammy";
import { userState } from "@/vars/state";
import { log } from "@/utils/handlers";
import { selectEmoji, setEmoji } from "./commands/setEmojis";

const steps: { [key: string]: any } = {
  setEmoji,
  selectEmoji,
};

export async function executeStep(
  ctx: CommandContext<Context> | CallbackQueryContext<Context>
) {
  const chatId = ctx.chat?.id;
  if (!chatId) return ctx.reply("Please redo your action");

  const queryCategory = ctx.callbackQuery?.data?.split("-").at(0);
  const step = userState[chatId] || queryCategory || "";
  const stepFunction = steps[step];

  if (stepFunction) {
    stepFunction(ctx);
  } else {
    log(`No step function for ${queryCategory} ${userState[chatId]}`);
  }
}
