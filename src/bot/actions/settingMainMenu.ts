import { BotCallbackContextType } from "@/types";
import { InlineKeyboard } from "grammy";
import { onlyAdmin } from "../utils";

export async function settingsMainMenu(ctx: BotCallbackContextType) {
  const isAdmin = await onlyAdmin(ctx);
  if (!isAdmin) return false;

  const text =
    "Customize your bot here. You can customize the message the bot would send to fit your project.";

  await ctx.editMessageText(text);
  await ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard()
      .text("Set emoji", "set-emoji")
      .text("Set GIF", "set-gif")
      .row()
      .text("Remove emoji", "remove-emoji")
      .text("Remove GIF", "remove-gif"),
  });
}
