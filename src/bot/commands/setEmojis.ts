import { getDocument } from "@/firebase";
import { StoredAdmins } from "@/types";
import { userState } from "@/vars/state";
import { TokenEmojis, tokenEmojiState, tokenEmojis } from "@/vars/tokenEmojis";
import { memoTokenData } from "@/vars/tokens";
import { trendingTokens } from "@/vars/trending";
import {
  CallbackQueryContext,
  CommandContext,
  Context,
  InlineKeyboard,
} from "grammy";
import { promises as fs } from "fs";
import path from "path";

const emojiJson = path.join(__dirname, "../../../", "emojis.json");

export async function setEmojis(ctx: CommandContext<Context>) {
  const username = ctx.from?.username;
  if (!username) return;

  // Setting token emojis
  let defaultTokenEmojis: TokenEmojis = {};
  try {
    defaultTokenEmojis = JSON.parse(
      await fs.readFile(emojiJson, "utf-8")
    ) as TokenEmojis;
  } catch (error) {
    await fs.writeFile(emojiJson, JSON.stringify(defaultTokenEmojis, null, 2));
  }

  for (const token in defaultTokenEmojis) {
    tokenEmojis[token] = defaultTokenEmojis[token];
  }

  const admins = await getDocument<StoredAdmins>({ collectionName: "admins" });
  const userIsAdmin =
    admins.findIndex(
      ({ username: storedUsername }) => storedUsername === username
    ) !== -1;

  if (!userIsAdmin) return;

  let keyboard = new InlineKeyboard();
  for (const token in trendingTokens) {
    const { baseToken } = memoTokenData[token];
    const { name } = baseToken;

    keyboard = keyboard
      .text(`${name} | ${tokenEmojis[token] || "🟢"}`, `selectEmoji-${token}`)
      .row();
  }

  ctx.reply("Select the token you want to add an emoji for.", {
    reply_markup: keyboard,
  });
}

export async function selectEmoji(ctx: CallbackQueryContext<Context>) {
  // @ts-expect-error temp
  const chatId = ctx.chat?.id || "";
  const token = ctx.callbackQuery.data.split("-").at(-1);

  ctx.deleteMessage();

  tokenEmojiState[chatId] = { token };
  userState[chatId] = "setEmoji";

  ctx.reply(
    "In the next message send the emoji you want to set for this token"
  );
}

export async function setEmoji(ctx: CommandContext<Context>) {
  const chatId = ctx.chat?.id || "";
  const emoji = ctx.message?.text;

  const { token } = tokenEmojiState[chatId];
  if (!emoji || !token) return ctx.reply("Please enter an emoji");

  delete userState[chatId];
  delete tokenEmojiState[chatId];

  tokenEmojis[token] = emoji;

  for (const token in tokenEmojis) {
    if (!Object.keys(trendingTokens).includes(token)) {
      delete tokenEmojis[token];
    }
  }

  fs.writeFile(emojiJson, JSON.stringify(tokenEmojis, null, 2));

  ctx.reply(`${emoji} set as the emoji for the selected token`);
}
