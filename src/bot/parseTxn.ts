import { TokenData } from "@/types/token";
import { TransactionData } from "@/types/txn";
import { apiFetcher, getTokenMetaData } from "@/utils/api";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import { BOT_USERNAME, EXPLORER_URL, TRENDING_CHANNEL_ID } from "@/utils/env";
import { projectGroups } from "@/vars/projectGroups";
import { teleBot } from "..";
import { InlineKeyboard } from "grammy";
import { errorHandler, log } from "@/utils/handlers";
import { advertisements } from "@/vars/advertisements";
import { roundNumber, toTitleCase } from "@/utils/general";
import { getTokenBalance } from "@/utils/web3";
import { trendingTokens } from "@/vars/trendingTokens";
import { toTrendTokens } from "@/vars/trending";

export async function parseTxn(txnData: TransactionData[]) {
  const firstTxn = txnData.at(0);
  if (!firstTxn) return log("No txn in this data");

  const { description, type, signature } = firstTxn;
  log(description);

  if (type !== "SWAP") return;
  const tokenSwapRegex = /(.+) swapped (.+) (.+) for (.+) (.+)/; // prettier-ignore

  const match = description.match(tokenSwapRegex);
  if (match) {
    const token = txnData.at(0)?.events.swap.tokenOutputs.at(-1)?.mint;
    const [, receiver, amountSpentNative, tokenSpent, amountReceived , tokenReceived ] = match; // prettier-ignore

    const groups = projectGroups.filter(
      ({ token: storedToken }) => storedToken === token
    );
    if (!token) return false;

    // eslint-disable-next-line
    const priceData =
      ((
        await apiFetcher(
          `https://api.dexscreener.com/latest/dex/tokens/${token}`
        )
      ).data as TokenData) || undefined;

    const firstPair = priceData.pairs.at(0);

    if (!firstPair) return false;
    const { baseToken, fdv } = firstPair;
    const { name, symbol } = baseToken;
    if (tokenReceived !== symbol) return false;
    log(`${signature} caught for ${tokenReceived} swap`);

    const priceUsd = Number(firstPair.priceUsd);
    const amountSpent = parseFloat(
      (priceUsd * Number(amountReceived)).toFixed(2)
    );

    const randomizeEmojiCount = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    let emojiCount = 0;
    if (amountSpent <= 10) {
      emojiCount = randomizeEmojiCount(5, 10);
    } else if (amountSpent <= 50) {
      emojiCount = randomizeEmojiCount(10, 35);
    } else if (amountSpent <= 100) {
      emojiCount = randomizeEmojiCount(35, 70);
    } else if (amountSpent > 1000) {
      emojiCount = randomizeEmojiCount(150, 200);
    } else {
      emojiCount = randomizeEmojiCount(70, 100);
    }

    const cleanedName = hardCleanUpBotMessage(name);
    const shortendReceiver = hardCleanUpBotMessage(
      `${receiver.slice(0, 3)}...${receiver.slice(
        receiver.length - 3,
        receiver.length
      )}`
    );
    const chartUrl = `https://dexscreener.com/solana/${token}`;
    const soulScanLink = `https://t.me/soul_scanner_bot?start=${token}`;
    const soulSniperLink = `https://t.me/soul_sniper_bot?start=TruTrend_${token}`;
    const magnum_url = `https://t.me/magnum_trade_bot?start=PHryLEnW_snipe_${token}`;
    const ttfbot_url = `https://t.me/ttfbotbot?start=${token}`;
    const keyboard = new InlineKeyboard().url(
      "TruTrend Solana Trending",
      "https://t.me/TruTrendSolana"
    );

    const balance = (await getTokenBalance(receiver, token)) || 0;
    let prevBalance = balance - Number(amountReceived);
    prevBalance = prevBalance < 0 ? 0 : prevBalance;

    const change = cleanUpBotMessage(
      prevBalance === 0
        ? "New!!!"
        : `\\+${((Number(amountReceived) / prevBalance) * 100).toFixed(2)}%`
    );

    // Metadata
    const metadata = await getTokenMetaData(token);
    const socials = [];
    for (const [social, socialLink] of Object.entries(
      metadata?.json?.extensions || {}
    )) {
      socials.push(`[${toTitleCase(social)}](${socialLink})`);
    }

    const trendingRank =
      trendingTokens.findIndex((trendingToken) => trendingToken === token) + 1;

    const icons = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    const icon = icons[trendingRank - 1] || "🔥";
    const trendingText = trendingRank
      ? `\n${icon} [_*Trending at #${trendingRank}*_](https://t.me/TruTrendSolana/11658)\n`
      : "";

    const activeAd = advertisements.find(({ status }) => status === "PAID");
    const adText = activeAd
      ? `Ad: [${hardCleanUpBotMessage(activeAd.text)}](${activeAd.link})`
      : `Ad: [Place your advertisement here](https://t.me/${BOT_USERNAME}?start=adBuyRequest)`;

    const getBodyText = (emoji: string) => {
      const greenEmojis = `${emoji || "🟢"}`.repeat(emojiCount);

      const text = `[${cleanedName} Buy\\!](https://t.me/${BOT_USERNAME})
${greenEmojis}

💲 *Spent*: ${cleanUpBotMessage(amountSpentNative)} ${hardCleanUpBotMessage(
        tokenSpent
      )} \\($${cleanUpBotMessage(amountSpent)}\\)
💰 *Got*: ${cleanUpBotMessage(
        Number(amountReceived).toFixed(2)
      )} ${hardCleanUpBotMessage(symbol)}
👤 *Buyer*: [${shortendReceiver}](${EXPLORER_URL}/account/${receiver})
📊 *MC*: \\$${cleanUpBotMessage(fdv.toLocaleString("en"))}
🏷 *Price*: \\$${cleanUpBotMessage(roundNumber(priceUsd))}
📈 *Position*: ${change}
${trendingText}
[*📊 Chart*](${chartUrl}) \\| [*✨ Tx*](${EXPLORER_URL}/tx/${signature}) 
[*👻 Soul Scan*](${soulScanLink}) \\| [*👻 Soul Sniper*](${soulSniperLink})
[*📡 TTF Bot*](${ttfbot_url}) \\| [*🎯 Magnum Bot*](${magnum_url})

_*${adText}*_
`;

      return text;
    };

    // ------------------------------ Trending channel alerts ------------------------------
    const toTrendData = toTrendTokens.find(
      ({ token: storedToken }) => storedToken === token
    );
    try {
      if (trendingRank > 0) {
        const gif = toTrendData?.gif;
        const trendingText = getBodyText(toTrendData?.emoji || ""); // prettier-ignore

        if (gif) {
          await teleBot.api.sendVideo(TRENDING_CHANNEL_ID || "", gif, {
            caption: trendingText,
            parse_mode: "MarkdownV2",
            reply_markup: keyboard,
            // @ts-expect-error disable_web_page_preview not in type
            disable_web_page_preview: true,
          });
        } else {
          await teleBot.api.sendMessage(
            TRENDING_CHANNEL_ID || "",
            trendingText,
            {
              parse_mode: "MarkdownV2",
              reply_markup: keyboard,
              // @ts-expect-error disable_web_page_preview not in type
              disable_web_page_preview: true,
            }
          );
        }
      }
    } catch (error) {
      errorHandler(error);
    }

    // ------------------------------ Custom channel alerts ------------------------------
    for (const group of groups) {
      const gif = group?.gif;

      try {
        if (gif) {
          await teleBot.api.sendVideo(group.chatId, gif, {
            caption: getBodyText(group?.emoji || ""),
            parse_mode: "MarkdownV2",
            reply_markup: keyboard,
            // @ts-expect-error disable_web_page_preview not in type
            disable_web_page_preview: true,
          });
        } else {
          await teleBot.api.sendMessage(
            group.chatId,
            getBodyText(group?.emoji || ""),
            {
              parse_mode: "MarkdownV2",
              // @ts-expect-error disable_web_page_preview not in type
              disable_web_page_preview: true,
            }
          );
        }
      } catch (error) {
        errorHandler(error);
      }
    }

    // for (const group of groups) {
    //   const { emoji, chatId } = group;
    //   const text = getBodyText(emoji || "🟢");

    //   if (amountSpent > 0) {
    //     if (group.gif) {
    //       teleBot.api
    //         .sendVideo(chatId, group.gif, {
    //           caption: cleanUpBotMessage(text),
    //           parse_mode: "MarkdownV2",
    //           reply_markup: keyboard,
    //           // @ts-expect-error disable_web_page_preview not in type
    //           disable_web_page_preview: true,
    //         })
    //         .catch(() => {
    //           if (group.gif) {
    //             teleBot.api
    //               .sendPhoto(chatId, group.gif, {
    //                 caption: cleanUpBotMessage(text),
    //                 parse_mode: "MarkdownV2",
    //                 reply_markup: keyboard,
    //                 // @ts-expect-error disable_web_page_preview not in type
    //                 disable_web_page_preview: true,
    //               })
    //               .catch(() =>
    //                 sendMessage(chatId, text, {
    //                   reply_markup: keyboard,
    //                   // @ts-expect-error disable_web_page_preview not in type
    //                   disable_web_page_preview: true,
    //                 })
    //               );
    //           }
    //         })
    //         .catch((e) => botRemovedError(e, chatid));
    //     } else {
    //       sendMessage(chatid, text, {
    //         reply_markup: keyboard,
    //         // @ts-expect-error disable_web_page_preview not in type
    //         disable_web_page_preview: true,
    //       });
    //     }
    //   }

    //   // // Competition txn indexing
    //   // const projectCompData = ongoingCompetitions.find(
    //   //   ({ chatid }) => chatid === group.chatid
    //   // );

    //   // if (projectCompData) {
    //   //   const currentTimestamp = getNowTimestamp();

    //   //   if (projectCompData.expiresat > currentTimestamp) {
    //   //     const data: StoredTxn = {
    //   //       comp: projectCompData.id || 0,
    //   //       amount: Number(amountReceived),
    //   //       buyer: receiver,
    //   //     };
    //   //     addRow("transactions", data);
    //   //     log(`Added transaction for ${receiver} of buy ${amountReceived}`);
    //   //   }
    //   // }
    // }
  }
}
