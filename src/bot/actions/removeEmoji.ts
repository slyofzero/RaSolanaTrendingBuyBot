import { BotCallbackContextType } from "@/types";
import { InlineKeyboard } from "grammy";
import { onlyAdmin } from "../utils";

export async function removeEmojiCallback(ctx: BotCallbackContextType) {
  const isAdmin = await onlyAdmin(ctx);
  if (!isAdmin) return false;

  const text = "Do you want to delete the emoji? It will revert back to 🟢.";

  await ctx.editMessageText(text);
  await ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard()
      .text("Main menu", "settings-main-menu")
      .text("Set GIF", "set-gif"),
  });
}
