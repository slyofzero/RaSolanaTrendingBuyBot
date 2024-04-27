import { getJetton } from "@/tonWeb3";
import { NewTransfer } from "@/types/var";
import { cleanUpBotMessage, sendMessage } from "@/utils/bot";
import { errorHandler, log } from "@/utils/handlers";
import { client, teleBot } from "..";
import { sleep } from "@/utils/time";
import {
  BOT_USERNAME,
  DEX_URL,
  EXPLORER_URL,
  GECKO_API,
  TRENDING_BOT_USERNAME,
  TRENDING_CHANNEL_ID,
  TRENDING_MSG,
} from "@/utils/env";
import { getDocument } from "@/firebase";
import { StoredGroup, TokenPoolData } from "@/types";
import { apiFetcher } from "@/utils/api";
import { Address } from "@ton/ton";
import { formatNumber } from "@/utils/general";
import { trendingTokens } from "@/vars/trendingTokens";

export async function scanNewTransfer(newTransfer: NewTransfer) {
  const { amount, receiver, hash } = newTransfer;

  try {
    const jetton = await getJetton(newTransfer.senderJettonWallet);
    const groups = (await getDocument({
      collectionName: "project_groups",
      queries: [["jetton", "==", jetton]],
    })) as StoredGroup[];

    const tokenRank = trendingTokens.findIndex((token) => token === jetton) + 1;

    if (!groups.length && tokenRank === 0) {
      return false;
    }

    const { decimals, name, symbol } = (
      await client.jettons.getJettonInfo(jetton)
    ).metadata;
    const jettonAddress = Address.parseRaw(jetton).toString({ urlSafe: true });

    const data = (
      await apiFetcher<TokenPoolData>(
        `${GECKO_API}/search/pools?query=${jettonAddress}&network=ton&page=1`
      )
    ).data.data.at(0);

    if (!data) {
      log(`No data found for ${jetton}`);
      return false;
    }

    const {
      base_token_price_usd: price_usd,
      base_token_price_native_currency: price_ton,
      fdv_usd,
      market_cap_usd,
      address,
    } = data.attributes;

    const receivedAmount = parseFloat(
      (Number(amount) / 10 ** Number(decimals)).toFixed(3)
    );
    const spentTON = parseFloat(
      (receivedAmount * Number(price_ton)).toFixed(2)
    );
    const spentUSD = parseFloat(
      (receivedAmount * Number(price_usd)).toFixed(2)
    );
    const displayTokenPrice = Number(price_usd).toFixed(6);

    const cleanedName = cleanUpBotMessage(name)
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
    const shortendReceiver = `${receiver.slice(0, 3)}...${receiver.slice(
      receiver.length - 3,
      receiver.length
    )}`.replace(/_/g, "_");
    const swapUrl = `${DEX_URL}/swap?chartVisible=true&tt=TON&ft=${symbol}`;
    const chartUrl = `https://www.geckoterminal.com/ton/pools/${address}`;
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

    console.log(tokenRank, jetton);

    const tokenRankText = tokenRank
      ? `@${TRENDING_BOT_USERNAME} \\| [TON Trending at #${tokenRank}](${TRENDING_MSG})`
      : "";

    if (tokenRank > 0) {
      const greenEmojis = "🟢".repeat(emojiCount);

      const text = `[${cleanedName} Buy!](https://t.me/${BOT_USERNAME})
${greenEmojis}

💲 *Spent*: ${spentTON} TON \\($${spentUSD}\\)
💰 *Got*: ${receivedAmount.toString()} ${symbol}
👤 *Buyer*: [${shortendReceiver}](${EXPLORER_URL}/${receiver})
📊 *MCap*: \\$${formatNumber(market_cap_usd || fdv_usd)}
🏷 *Price*: \\$${displayTokenPrice}

[✨ Tx](${EXPLORER_URL}/transaction/${hash}) \\| [📊 Chart](${chartUrl}) \\| [🔀 Swap](${swapUrl})

Powered by @${BOT_USERNAME}
${tokenRankText}`;

      sendMessage(TRENDING_CHANNEL_ID || "", text, {
        // @ts-expect-error disable_web_page_preview not in type
        disable_web_page_preview: true,
      });
    }

    for (const group of groups) {
      const { chatId, emoji } = group;

      const greenEmojis = `${emoji || "🟢"}`.repeat(emojiCount);

      const text = `[${cleanedName} Buy!](https://t.me/${BOT_USERNAME})
${greenEmojis}

💲 *Spent*: ${spentTON} TON \\($${spentUSD}\\)
💰 *Got*: ${receivedAmount.toString()} ${symbol}
👤 *Buyer*: [${shortendReceiver}](${EXPLORER_URL}/${receiver})
📊 *MCap*: \\$${formatNumber(market_cap_usd || fdv_usd)}
🏷 *Price*: \\$${displayTokenPrice}

[✨ Tx](${EXPLORER_URL}/transaction/${hash}) \\| [📊 Chart](${chartUrl}) \\| [🔀 Swap](${swapUrl})

Powered by @${BOT_USERNAME}
${tokenRankText}`;

      if (group.gif) {
        teleBot.api.sendVideo(chatId, group.gif, {
          caption: cleanUpBotMessage(text),
          parse_mode: "MarkdownV2",
        });
      } else {
        // @ts-expect-error disable_web_page_preview not in type
        sendMessage(chatId, text, { disable_web_page_preview: true });
      }
    }

    return true;
  } catch (error) {
    log("Retrying notification");
    errorHandler(error);

    await sleep(1500);
    return await scanNewTransfer(newTransfer);
  }
}
