import { errorHandler, log } from "@/utils/handlers";
import { memoTokenData } from "@/vars/tokens";
import { trendingBuyAlertBots } from "..";
import { TRENDING_CHANNEL_ID, TRENDING_LINK } from "@/utils/env";
import { trendingTokens } from "@/vars/trending";
import { getRandomItemFromArray } from "@/utils/general";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import { toTrendTokens } from "@/vars/toTrend";
import { advertisements } from "@/vars/advertisements";
import { tokenEmojis } from "@/vars/tokenEmojis";

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
    if (sentUsdNumber < 100) return;
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
    const emojis = `${
      toTrendToken ? toTrendToken.emoji : `${tokenEmojis[token] || "🟢"}`
    }`.repeat(emojiCount);

    // links
    const buyerLink = `https://solscan.io/account/${buyer}`;
    const txnLink = `https://solscan.io/tx/${signature}`;
    const dexSLink = `https://dexscreener.com/solana/${token}`;
    const photonLink = `https://photon-sol.tinyastro.io/en/lp/${token}`;
    const advertisement = advertisements.at(0);
    let advertisementText = "";

    if (advertisement) {
      const { text, link } = advertisement;
      advertisementText = `*_Ad: [${text}](${link})_*`;
    } else {
      advertisementText = `*_Ad: [Place your advertisement here](https://t.me/RaSolanaTrendingBot?start=adBuyRequest)_*`;
    }

    const telegramLink = info?.socials?.find(
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
💸 [Market Cap](${dexSLink}) $${cleanUpBotMessage(fdv.toLocaleString("en"))}

[DexS](${dexSLink}) \\| [Photon](${photonLink}) \\| ${specialLink} \\| [Trending](${TRENDING_LINK})

${advertisementText}`;

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
