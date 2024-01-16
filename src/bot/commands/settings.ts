import { BotCommandContextType } from "@/types";
import { InlineKeyboard } from "grammy";

export async function settings(ctx: BotCommandContextType) {
  const { type } = ctx.chat;

  if (type === "private") return false;

  const text = `Customize your bot here. You can customize the message the bot would send to fit your project.`;
  const keyboard = new InlineKeyboard().text("Set emoji", "set-emoji").text("Set GIF", "set-gif");

  ctx.reply(text, { reply_markup: keyboard });
}
