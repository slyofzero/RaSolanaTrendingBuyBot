import { errorHandler, log } from "@/utils/handlers";
import { memoTokenData } from "@/vars/tokens";
import { trendingBuyAlertBot } from "..";
import {
  TRENDING_BOT_USERNAME,
  TRENDING_CHANNEL_ID,
  TRENDING_CHANNEL_LINK,
} from "@/utils/env";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import { toTrendTokens } from "@/vars/toTrend";
import { advertisements } from "@/vars/advertisements";
import { tokenEmojis } from "@/vars/tokenEmojis";
import { trendingMessageId } from "@/vars/message";

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

    // Preparing message for token
    const tokenData = memoTokenData[token];
    const { symbol } = tokenData.baseToken;
    const { priceNative, priceUsd, fdv, info } = tokenData;
    const sentUsdNumber = amount * Number(priceUsd);

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
      advertisementText = `*_Ad: [Place your advertisement here](https://t.me/${TRENDING_BOT_USERNAME}?start=adBuyRequest)_*`;
    }

    const telegramLink = info?.socials?.find(
      ({ type }) => type.toLowerCase() === "telegram"
    )?.url;

    const specialLink = telegramLink
      ? `[Telegram](${telegramLink})`
      : `[Screener](${dexSLink})`;

    const message = `*[${hardCleanUpBotMessage(symbol)}](${
      telegramLink || dexSLink
    }) Buy\\!*
${emojis}

🔀 ${sentNative} SOL *\\($${sentUsd}\\)*
🔀 ${formattedAmount} *${hardCleanUpBotMessage(symbol)}*
🪙 Position ${hardCleanUpBotMessage(position)}
👤 [Buyer](${buyerLink}) \\| [Txn](${txnLink}  )
💸 [Market Cap](${dexSLink}) $${cleanUpBotMessage(fdv.toLocaleString("en"))}

[DexS](${dexSLink}) \\| [Photon](${photonLink}) \\| ${specialLink} \\| [Trending](${TRENDING_CHANNEL_LINK}/${trendingMessageId})

${advertisementText}`;

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
  } catch (error) {
    errorHandler(error);
  }
}
