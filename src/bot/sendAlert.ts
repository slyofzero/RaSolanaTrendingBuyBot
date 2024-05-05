import { TokenPoolData, TxnData } from "@/types";
import { bannedTokens, trendingIcons } from "@/utils/constants";
import { client, teleBot } from "..";
import {
  BOT_USERNAME,
  TRENDING_CHANNEL_ID,
  COINGECKO_API_KEY,
  DEX_URL,
  EXPLORER_URL,
  TRENDING_MSG,
} from "@/utils/env";
import { getJetton } from "@/tonWeb3";
import { Address, fromNano } from "@ton/ton";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import { apiFetcher } from "@/utils/api";
import { errorHandler, log } from "@/utils/handlers";
import { projectGroups } from "@/vars/projectGroups";
import { trendingTokens } from "@/vars/trendingTokens";
import { toTrendTokens } from "@/vars/trending";
import { advertisements } from "@/vars/advertisements";
import { InlineKeyboard } from "grammy";

export async function sendAlert(txnData: TxnData) {
  try {
    const { pool, jettonWallet, amountReceived, receiver, hash } = txnData;

    // Don't allow if banned
    const jetton = txnData.jetton || (await getJetton(jettonWallet || ""));
    const groups = projectGroups.filter(
      ({ jetton: token }) => token === jetton
    );

    const tokenRank = trendingTokens.findIndex((token) => token === jetton) + 1;
    if (bannedTokens.includes(jetton) || (!groups.length && tokenRank === 0))
      return;

    const { decimals, name, symbol } = (
      await client.jettons.getJettonInfo(jetton)
    ).metadata;
    const friendlyJetton = Address.parse(jetton).toString();
    const jettonAddress = Address.parseRaw(jetton).toString({ urlSafe: true });

    const poolsData = (
      await apiFetcher<TokenPoolData>(
        `https://pro-api.coingecko.com/api/v3/onchain/networks/ton/tokens/${jettonAddress}/pools`,
        { "x-cg-pro-api-key": COINGECKO_API_KEY || "" }
      )
    )?.data.data;

    const data = poolsData.at(0);

    if (!data) {
      log(`No data found for ${jetton}`);
      return false;
    }

    log(`Txn ${hash} for ${symbol}`);

    const pools = poolsData.map(({ attributes }) =>
      Address.parse(attributes.address).toRawString()
    );

    // To make sure that only pools are sending out tokens as only those are buys
    const txnSenderIsPool = pools.includes(pool);
    if (!txnSenderIsPool) {
      log(`Sender of ${jetton} is not a pool`);
      return false;
    }

    const friendlyReceiver = Address.parse(receiver).toString({
      urlSafe: true,
    });

    const {
      base_token_price_usd: price_usd,
      base_token_price_native_currency: price_ton,
      fdv_usd,
      market_cap_usd,
      address,
      reserve_in_usd,
    } = data.attributes;

    const receivedAmount = parseFloat(
      (Number(amountReceived) / 10 ** Number(decimals)).toFixed(3)
    );

    const txnLink = `${EXPLORER_URL}/transaction/${hardCleanUpBotMessage(
      hash
    )}`;
    const spentTON = parseFloat(
      (receivedAmount * Number(price_ton)).toFixed(2)
    );
    const spentUSD = parseFloat(
      (receivedAmount * Number(price_usd)).toFixed(2)
    );

    // Don't allow if txn too low
    if (spentTON < 1) return;

    const displayTokenPrice = cleanUpBotMessage(Number(price_usd).toFixed(6));

    const cleanedName = cleanUpBotMessage(name)
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
    const shortendReceiver = hardCleanUpBotMessage(
      `${friendlyReceiver.slice(0, 3)}...${friendlyReceiver.slice(
        friendlyReceiver.length - 3,
        friendlyReceiver.length
      )}`
    );

    const swapUrl =
      data.relationships.dex.data.id === "dedust"
        ? `https://dedust.io/swap/TON/${symbol}`
        : `${DEX_URL}/swap?chartVisible=true&tt=TON&ft=${symbol}`;
    const chartUrl = `https://www.geckoterminal.com/ton/pools/${hardCleanUpBotMessage(
      address
    )}`;
    const dexsUrl = `https://dexscreener.com/ton/${hardCleanUpBotMessage(
      friendlyJetton
    )}`;
    let emojiCount = 0;

    const randomizeEmojiCount = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    if (spentUSD <= 10) {
      emojiCount = randomizeEmojiCount(5, 10);
    } else if (spentUSD <= 50) {
      emojiCount = randomizeEmojiCount(10, 35);
    } else if (spentUSD <= 100) {
      emojiCount = randomizeEmojiCount(35, 70);
    } else if (spentUSD > 1000) {
      emojiCount = randomizeEmojiCount(150, 200);
    } else {
      emojiCount = randomizeEmojiCount(70, 100);
    }

    //   const icon = trendingIcons[tokenRank - 1];
    const holdersPromise = client.jettons.getJettonInfo(jetton);
    const walletBalancePromise =
      client.accounts.getAccountJettonsBalances(receiver);
    const walletTonBalancePromise = client.accounts.getAccount(receiver);

    const [holders, balances, walletBalance] = await Promise.all([
      holdersPromise,
      walletBalancePromise,
      walletTonBalancePromise,
    ]);

    const walletTonBalance = cleanUpBotMessage(
      Number(fromNano(walletBalance.balance)).toFixed(2)
    );
    const mcap = cleanUpBotMessage(
      Number(Number(market_cap_usd || fdv_usd).toFixed(2)).toLocaleString()
    );
    const liquidity = cleanUpBotMessage(
      Number(Number(reserve_in_usd).toFixed(2)).toLocaleString()
    );

    const tokenBalance =
      Number(
        balances.balances.find(({ jetton: token }) => token.address === jetton)
          ?.balance
      ) || 0;
    const adjustedBalance = tokenBalance / 10 ** Number(decimals);
    const prevBalance = Number((adjustedBalance - receivedAmount).toFixed(2));
    const balanceChange =
      prevBalance > 0 ? (receivedAmount / prevBalance) * 100 : 0;
    const balanceChangeText = hardCleanUpBotMessage(
      prevBalance <= 0 ? "New!!!" : `+${balanceChange.toFixed(0)}%`
    );

    const holdersUrl = `https://tonviewer.com/${jetton}?section=holders`;

    const icon = trendingIcons[tokenRank - 1];
    const tokenRankText = tokenRank
      ? `*[TON Trending at ${icon}](${TRENDING_MSG})* \\| `
      : "";

    const keyboard = new InlineKeyboard()
      .url("Book Trending", `https://t.me/InsectTonBuyBot?start=trend`)
      .url(`Buy ${symbol}`, swapUrl);

    const toTrendData = toTrendTokens.find(
      ({ token }) => Address.parse(token).toRawString() === jetton
    );
    const activeAd = advertisements.find(({ status }) => status === "PAID");
    const adText = activeAd
      ? `Ad: [${hardCleanUpBotMessage(activeAd.text)}](${activeAd.link})`
      : `Ad: [Place your advertisement here](https://t.me/${BOT_USERNAME}?start=adBuyRequest)`;

    const getBodyText = (emoji: string) => {
      const greenEmojis = `${emoji || "👾"}`.repeat(emojiCount);

      const text = `[${cleanedName} Buy\\!](https://t.me/${BOT_USERNAME})
${greenEmojis}

💲 *Spent*: ${cleanUpBotMessage(spentTON)} TON \\($${cleanUpBotMessage(
        spentUSD
      )}\\)
💰 *Got*: ${cleanUpBotMessage(receivedAmount)} ${symbol}
👤 *Buyer*: [${shortendReceiver}](${EXPLORER_URL}/${receiver})
📊 *MCap*: \\$${mcap}
🏷 *Price*: \\$${displayTokenPrice}
💧 *Liquidity*: \\$${liquidity}
💹 *Position*: ${balanceChangeText}
💵 *Wallet Balance*: ${walletTonBalance} TON

[✨ Tx](${txnLink}) \\| [🔀 Buy](${swapUrl})
[🦅 DexS](${dexsUrl})  \\| [🦎 Gecko](${chartUrl}) 
[👨 ${holders.holders_count} Holders](${holdersUrl})

_*${adText}*_

Powered by @${BOT_USERNAME}`;

      return text;
    };

    // ------------------------------ Trending channel alerts ------------------------------
    try {
      if (tokenRank > 0) {
        const gif = toTrendData?.gif;

        if (gif) {
          const trendingText = `${tokenRankText}${getBodyText(toTrendData?.emoji || "")}`; // prettier-ignore
          await teleBot.api.sendVideo(TRENDING_CHANNEL_ID || "", gif, {
            caption: trendingText,
            parse_mode: "MarkdownV2",
            reply_markup: keyboard,
            // @ts-expect-error disable_web_page_preview not in type
            disable_web_page_preview: true,
          });
        } else {
          const trendingText = `${tokenRankText}${getBodyText(toTrendData?.emoji || "")}`; // prettier-ignore
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
  } catch (error) {
    errorHandler(error);
  }
}
