import { errorHandler, log } from "@/utils/handlers";
import { memoTokenData } from "@/vars/tokens";
import { teleBot, trendingBuyAlertBots } from "..";
import { TRENDING_CHANNEL_ID } from "@/utils/env";
import { trendingTokens } from "@/vars/trending";
import { getRandomItemFromArray } from "@/utils/general";
import { projectGroups } from "@/vars/projectGroups";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";

export interface BuyData {
  buyer: string;
  amount: number;
  token: string;
  change: number;
  signature: string;
}

export async function sendAlert(data: BuyData) {
  try {
    const { buyer, amount, token, signature, change } = data;
    const groups = projectGroups.filter(
      ({ token: groupToken }) => groupToken === token
    );
    const isTrending = Object.keys(trendingTokens).includes(token);
    if (!isTrending || !groups.length) return;

    // Preparing message for token
    const tokenData = memoTokenData[token];
    const { symbol } = tokenData.baseToken;
    const { priceNative, priceUsd, fdv } = tokenData;
    const sentNative = cleanUpBotMessage((amount * Number(priceNative)).toFixed(2)); // prettier-ignore
    const sentUsd = cleanUpBotMessage((amount * Number(priceUsd)).toFixed(2));
    const formattedAmount = cleanUpBotMessage(amount.toLocaleString("en"));

    // links
    const buyerLink = `https://solscan.io/account/${buyer}`;
    const txnLink = `https://solscan.io/tx/${signature}`;
    const dexTLink = `https://www.dextools.io/app/en/solana/pair-explorer/${token}`;
    const dexSLink = `https://dexscreener.com/solana/7fdjh3zyup8ri6j8nglcpcxqsak8d9vbpab7pvibg4d1/${token}`;
    const trendingLink = `https://t.me/c/2125443386/2`;

    const message = `🔀 $${sentUsd} \\(${sentNative} SOL\\)
🔀 ${formattedAmount} ${hardCleanUpBotMessage(symbol)}
👤 [Buyer]${buyerLink} / [TX]${txnLink}
🪙 Position \\+${cleanUpBotMessage(change)}%
💸 Market Cap $${cleanUpBotMessage(fdv.toLocaleString("en"))}

[DexT](${dexSLink}) \\| [Screener](${dexTLink}) \\| [Trending](${trendingLink})`;

    if (isTrending) {
      const trendingBuyAlertBot = getRandomItemFromArray(trendingBuyAlertBots);
      trendingBuyAlertBot.api
        .sendMessage(TRENDING_CHANNEL_ID || "", message)
        .catch((e) => errorHandler(e));
    }

    for (const group of groups) {
      return teleBot.api
        .sendMessage(group.chatId, message)
        .catch((e) => errorHandler(e));
    }
  } catch (error) {
    errorHandler(error);
  }
}
