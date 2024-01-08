import { BotCommandContextType } from "@/types";
import { sendMessage } from "@/utils";
import { InlineKeyboard } from "grammy";

export async function startBot(ctx: BotCommandContextType) {
  const { chat } = ctx;
  const text = `*Welcome to JettonSniperBot*`;

  const keyboard = new InlineKeyboard()
    .text("Buy", "bot-action-buy")
    .text("Sell", "bot-action-sell")
    .row()
    .text("Wallet", "bot-action-wallet");

  sendMessage(chat.id, text, { reply_markup: keyboard });
}
