import { BotCallbackContextType } from "@/types";
import { InlineKeyboard } from "grammy";

export async function setEmojiCallback(ctx: BotCallbackContextType) {
  const text =
    "The green circle emoji 🟢 in the messages would be replaced with your custom one.\n\nTo set an emoji do - /set_emoji <emoji>";

  ctx.editMessageText(text);
  ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard()
      .text("Main menu", "settings-main-menu")
      .text("Set GIF", "set-gif"),
  });
}
