import { errorHandler, log } from "@/utils/handlers";
import { memoTokenData } from "@/vars/tokens";
import { trendingBuyAlertBots } from "..";
import { TRENDING_CHANNEL_ID } from "@/utils/env";
import { trendingTokens } from "@/vars/trending";
import { getRandomItemFromArray } from "@/utils/general";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import { toTrendTokens } from "@/vars/toTrend";

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
    const isTrending = Object.keys(trendingTokens).includes(token);
    // console.log(isTrending, groups.length);
    if (!isTrending) return;

    // Preparing message for token
    const tokenData = memoTokenData[token];
    const { symbol } = tokenData.baseToken;
    const { priceNative, priceUsd, fdv, info } = tokenData;
    const sentUsdNumber = amount * Number(priceUsd);
    if (sentUsdNumber < 1) return;
    const sentNative = cleanUpBotMessage((amount * Number(priceNative)).toFixed(2)); // prettier-ignore
    const sentUsd = cleanUpBotMessage(sentUsdNumber.toFixed(2));
    const formattedAmount = cleanUpBotMessage(amount.toLocaleString("en"));
    const position = change ? `+${change}%` : "New!!!";

    log(`${buyer} bought ${amount} ${symbol}`);

    const randomizeEmojiCount = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    const toTrendToken = toTrendTokens.find(
      ({ token: storedToken }) => storedToken === token
    );

    let emojiCount = 0;
    if (sentUsdNumber <= 50) {
      emojiCount = randomizeEmojiCount(5, 10);
    } else if (sentUsdNumber <= 100) {
      emojiCount = randomizeEmojiCount(10, 35);
    } else {
      emojiCount = randomizeEmojiCount(35, 70);
    }
    const emojis = `${toTrendToken ? toTrendToken.emoji : "🟢"}`.repeat(
      emojiCount
    );

    // links
    const buyerLink = `https://solscan.io/account/${buyer}`;
    const txnLink = `https://solscan.io/tx/${signature}`;
    const dexSLink = `https://dexscreener.com/solana/7fdjh3zyup8ri6j8nglcpcxqsak8d9vbpab7pvibg4d1/${token}`;
    const trendingLink = `https://t.me/c/2125443386/2`;
    const photonLink = `https://photon-sol.tinyastro.io/en/lp/${token}`;

    const telegramLink = info.socials.find(
      ({ type }) => type.toLowerCase() === "telegram"
    )?.url;

    const specialLink = telegramLink
      ? `[Telegram](${telegramLink})`
      : `[Screener](${dexSLink})`;

    const message = `*[${symbol}](${telegramLink || dexSLink}) Buy\\!*
${emojis}

🔀 $${sentNative} SOL *\\($${sentUsd}\\)*
🔀 ${formattedAmount} *${hardCleanUpBotMessage(symbol)}*
👤 [Buyer](${buyerLink}) \\| [Txn](${txnLink}  )
🪙 Position ${hardCleanUpBotMessage(position)}
💸 [Market Cap $${cleanUpBotMessage(fdv.toLocaleString("en"))}](${dexSLink})

[Photon](${photonLink}) \\| ${specialLink} \\| [Trending](${trendingLink})`;

    // Sending Message
    if (isTrending) {
      const trendingBuyAlertBot = getRandomItemFromArray(trendingBuyAlertBots);

      try {
        if (toTrendToken?.gif) {
          await trendingBuyAlertBot.api.sendAnimation(
            TRENDING_CHANNEL_ID || "",
            toTrendToken.gif,
            {
              parse_mode: "MarkdownV2",
              // @ts-expect-error Type not found
              disable_web_page_preview: true,
              caption: message,
            }
          );
        } else {
          await trendingBuyAlertBot.api.sendMessage(
            TRENDING_CHANNEL_ID || "",
            message,
            {
              parse_mode: "MarkdownV2",
              // @ts-expect-error Type not found
              disable_web_page_preview: true,
            }
          );
        }
      } catch (error) {
        console.log(message);
        errorHandler(error);
      }
    }
  } catch (error) {
    errorHandler(error);
  }
}

// import { errorHandler, log } from "@/utils/handlers";
// import { memoTokenData } from "@/vars/tokens";
// import { teleBot, trendingBuyAlertBots } from "..";
// import { TRENDING_CHANNEL_ID } from "@/utils/env";
// import { trendingTokens } from "@/vars/trending";
// import { getRandomItemFromArray } from "@/utils/general";
// import { projectGroups } from "@/vars/projectGroups";

// export interface BuyData {
//   buyer: string;
//   amount: number;
//   token: string;
//   change: number;
//   signature: string;
// }

// export async function sendAlert(data: BuyData) {
//   try {
//     const { buyer, amount, token } = data;
//     const tokenData = memoTokenData[token];
//     const { symbol } = tokenData.baseToken;

//     const groups = projectGroups.filter(
//       ({ token: groupToken }) => groupToken === token
//     );

//     const isTrending = Object.keys(trendingTokens).includes(token);
//     const message = `${buyer} bought ${amount} ${symbol}`;
//     log(message);

//     if (isTrending) {
//       const trendingBuyAlertBot = getRandomItemFromArray(trendingBuyAlertBots);
//       trendingBuyAlertBot.api
//         .sendMessage(TRENDING_CHANNEL_ID || "", message)
//         .catch((e) => errorHandler(e));
//     }

//     for (const group of groups) {
//       return teleBot.api
//         .sendMessage(group.chatId, message)
//         .catch((e) => errorHandler(e));
//     }
//   } catch (error) {
//     errorHandler(error);
//   }
// }
