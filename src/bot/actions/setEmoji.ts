import { BotCallbackContextType } from "@/types";
import { InlineKeyboard } from "grammy";
import { onlyAdmin } from "../utils";

export async function setEmojiCallback(ctx: BotCallbackContextType) {
  const isAdmin = await onlyAdmin(ctx);
  if (!isAdmin) return false;

  const text =
    "The green circle emoji 🟢 in the messages would be replaced with your custom one.\n\nTo set an emoji do - /setemoji <emoji>";

  await ctx.editMessageText(text);
  await ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard()
      .text("Main menu", "settings-main-menu")
      .text("Set GIF", "set-gif"),
  });
}
