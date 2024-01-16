import { BotCommandContextType } from "@/types";
import { InlineKeyboard } from "grammy";
import { onlyAdmin } from "../utils";

export async function settings(ctx: BotCommandContextType) {
  const { type } = ctx.chat;

  let text = "";
  if (type === "private") {
    text = "Only works in groups or channels";
    ctx.reply(text);
    return false;
  }

  const isAdmin = await onlyAdmin(ctx);
  if (!isAdmin) return false;

  text =
    "Customize your bot here. You can customize the message the bot would send to fit your project.";
  const keyboard = new InlineKeyboard().text("Set emoji", "set-emoji").text("Set GIF", "set-gif");

  ctx.reply(text, { reply_markup: keyboard });
}
