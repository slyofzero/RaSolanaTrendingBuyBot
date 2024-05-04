import {
  addDocument,
  getDocument,
  getDocumentById,
  updateDocumentById,
} from "@/firebase";
import { PairsData, StoredAdvertisement } from "@/types";
import { StoredAccount } from "@/types/accounts";
import { StoredToTrend } from "@/types/trending";
import { cleanUpBotMessage, hardCleanUpBotMessage } from "@/utils/bot";
import {
  adPrices,
  transactionValidTime,
  trendPrices,
  workchain,
} from "@/utils/constants";
import { decrypt, encrypt } from "@/utils/cryptography";
import {
  BOT_USERNAME,
  CHANNEL_ID,
  TOKEN_DATA_URL,
  TRENDING_TOKENS_API,
} from "@/utils/env";
import { roundUpToDecimalPlace } from "@/utils/general";
import { errorHandler, log } from "@/utils/handlers";
import { getSecondsElapsed, sleep } from "@/utils/time";
import { generateAccount, splitPayment } from "@/utils/web3";
import { syncAdvertisements } from "@/vars/advertisements";
import { advertisementState, trendingState } from "@/vars/state";
import { syncToTrend } from "@/vars/trending";
import { Timestamp } from "firebase-admin/firestore";
import { CallbackQueryContext, Context, InlineKeyboard } from "grammy";
import { customAlphabet } from "nanoid";
import { tonClient } from "@/rpc";
import { mnemonicToPrivateKey } from "ton-crypto";
import { WalletContractV4, fromNano, toNano } from "@ton/ton";
import { apiFetcher, apiPoster } from "@/utils/api";
import { teleBot } from "..";
import { TokenPoolData } from "@/types/terminalData";

const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const length = 10; // You can change the length as needed
const nanoid = customAlphabet(alphabet, length);

export async function getUnlockedAccount() {
  let publicKey: string = "";

  const notLockedAccount = (
    await getDocument<StoredAccount>({
      collectionName: "accounts",
      queries: [["locked", "!=", true]],
    })
  ).at(0);

  // Only lock if the purchase isn't an admin purchase
  if (notLockedAccount) {
    publicKey = notLockedAccount.publicKey;
    updateDocumentById({
      id: notLockedAccount.id || "",
      collectionName: "accounts",
      updates: { locked: true, lockedAt: Timestamp.now() },
    });
  } else {
    const newAccount = await generateAccount();
    publicKey = newAccount.publicKey;

    const newAccountData: StoredAccount = {
      publicKey,
      secretKey: encrypt(JSON.stringify(newAccount.secretKey)),
      locked: true,
      lockedAt: Timestamp.now(),
    };

    addDocument({ data: newAccountData, collectionName: "accounts" });
  }

  return publicKey;
}

export async function preparePayment(ctx: CallbackQueryContext<Context>) {
  // @ts-expect-error temp
  const chatId = ctx.chat?.id;
  const username = ctx.from.username;
  if (!chatId || !username)
    return ctx.reply("Please restart the bot interaction again");

  const isTrendingPayment = Boolean(trendingState[chatId]);
  const commandToRedo = isTrendingPayment ? `/trend` : `/advertise`;

  try {
    ctx.deleteMessage();
    const slot =
      trendingState[chatId]?.slot || advertisementState[chatId]?.slot;
    const account = await getUnlockedAccount();
    const hash = nanoid(10);

    const { duration } = trendingState[chatId] || advertisementState[chatId];
    if (!duration || !slot)
      return ctx.reply(`Please do ${commandToRedo} again`);

    // ------------------------------ Calculating prices based on trend or ad buy ------------------------------
    let priceTon = 0;
    if (isTrendingPayment) {
      priceTon = trendPrices[slot as 1 | 2 | 3][duration];
    } else {
      priceTon = adPrices[duration];
    }

    const displaySlot = !isTrendingPayment
      ? slot
      : slot === 1
      ? "1-3"
      : slot === 2
      ? "3-10"
      : "11-20";
    const paymentCategory = isTrendingPayment ? "trendingPayment" : "adPayment";

    let text = "";

    if (isTrendingPayment) {
      const { token, social } = trendingState[chatId];
      text = `🥇 Trending Fast Track

Token: \`${token}\`
Link: \`${social}\`
Trending position: ${displaySlot}
Length: ${duration} Hours
Price: ${priceTon} TON
`;
    } else {
      const { text: adText, link } = advertisementState[chatId];

      text = `🧿 Advertisement Buy

Text: \`${adText}\`
Link: \`${link}\`
Length: ${duration} Hours
Price: ${priceTon} TON
`;
    }

    text += `
_*⚠️ Do NOT send from an exchange or Telegram Wallet. Otherwise, potential refunds are forfeited.*_

⬇️ Your Payment Wallet \\(click to copy\\)
\`${account}\`

You have 20 minutes to complete the transaction and confirm. All funds sent after 20 minutes will be marked invalid.

➡️ Send ${priceTon} TON to the payment wallet and wait for the TXN to confirm on the blockchain. Then click VERIFY TX.`;

    text = text.replace(/\./g, "\\.").replace(/-/g, "\\-");
    const keyboard = new InlineKeyboard().text(
      "VERIFY TX",
      `${paymentCategory}-${hash}`
    );

    ctx.reply(text, { parse_mode: "MarkdownV2", reply_markup: keyboard });

    const collectionName = isTrendingPayment ? "to_trend" : "advertisements";
    let dataToAdd: StoredToTrend | StoredAdvertisement = {
      paidAt: Timestamp.now(),
      sentTo: account,
      amount: priceTon,
      slot: slot,
      duration: duration,
      hash,
      status: "PENDING",
      initiatedBy: chatId,
      username,
    } as StoredToTrend | StoredAdvertisement;

    if (isTrendingPayment) {
      const { token, social, gif, emoji } = trendingState[chatId];
      dataToAdd = {
        ...dataToAdd,
        // @ts-expect-error weird
        token: token || "",
        socials: social || "",
        gif: gif || "",
        emoji: emoji || "",
      };
    } else {
      const { text, link } = advertisementState[chatId];
      dataToAdd = {
        ...dataToAdd,
        text: text || "",
        link: link || "",
      };
    }

    addDocument({
      collectionName,
      data: dataToAdd,
      id: hash,
    });

    delete trendingState[chatId];
    delete advertisementState[chatId];

    return true;
  } catch (error) {
    errorHandler(error);
    ctx.reply(
      `An error occurred. Please don't follow with the payment and instead do ${commandToRedo} in the same way you used earlier.`
    );

    return false;
  }
}

export async function confirmPayment(ctx: CallbackQueryContext<Context>) {
  try {
    const from = ctx.from;
    const callbackData = ctx.callbackQuery.data;
    const [category, hash] = callbackData.split("-");
    const isTrendingPayment = category === "trendingPayment";
    const collectionName = isTrendingPayment ? "to_trend" : "advertisements";

    if (!from || !callbackData || !hash) {
      return ctx.reply("Please click on the button again");
    }

    const confirmingMessage = await ctx.reply(
      "Checking for payment receival, a confirmation message would be sent to you in a short while. Expected time - 60 seconds"
    );

    const trendingPayment = await getDocumentById<StoredToTrend>({
      collectionName,
      id: hash,
    });

    if (!trendingPayment) {
      log(`Payment not found for hash ${hash}`);
      return await ctx.reply(
        `Your payment wasn't found. Please contact the admins and provide them the hash - ${hash}.`
      );
    }

    const { paidAt, sentTo, amount, duration, slot, token, socials } =
      trendingPayment;
    const paymentAmount = toNano(amount);
    const timeSpent = getSecondsElapsed(paidAt.seconds);

    if (timeSpent > transactionValidTime) {
      log(`Transaction ${hash} has expired`);
      return await ctx.reply(
        `Your payment duration has expired. You were warned not to pay after 20 minutes of payment message generation. If you have already paid, contact the admins.`
      );
    }

    const storedAccount = (
      await getDocument<StoredAccount>({
        queries: [["publicKey", "==", sentTo]],
        collectionName: "accounts",
      })
    ).at(0);

    if (!storedAccount) {
      log(`Account for payment hash ${hash} not found`);
      const text = `The account your payment was sent to wasn't found. Please contact the admins and provide them the hash - \`${hash}\`.`;

      return await ctx.reply(cleanUpBotMessage(text), {
        parse_mode: "MarkdownV2",
      });
    }

    const { secretKey: encryptedSecretKey } = storedAccount;
    const decryptedMnemonic: string[] = JSON.parse(decrypt(encryptedSecretKey));

    const keypair = await mnemonicToPrivateKey(decryptedMnemonic);
    const wallet = WalletContractV4.create({
      workchain,
      publicKey: keypair.publicKey,
    });
    const walletContract = tonClient.open(wallet);

    attemptsCheck: for (const attempt_number of Array.from(Array(20).keys())) {
      try {
        log(
          `Checking for subscription payment, Attempt - ${attempt_number + 1}`
        );

        // Checking if payment was made
        const balance = await walletContract.getBalance();
        const balanceTon = Number(Number(fromNano(balance)).toFixed(2));
        const paymentTon = Number(Number(fromNano(paymentAmount)).toFixed(2));

        if (balanceTon < paymentTon) {
          log(`Transaction amount doesn't match`);
          await sleep(30000);
          continue attemptsCheck;
        }

        const logText = `${BOT_USERNAME} transaction ${hash} for ${collectionName} verified with payment of ${amount} TON.\nSlot ${slot}, duration ${duration} hours`;
        log(logText);
        const currentTimestamp = Timestamp.now();

        await updateDocumentById({
          updates: {
            status: "PAID",
            paidAt: currentTimestamp,
            expiresAt: new Timestamp(
              currentTimestamp.seconds + duration * 60 * 60,
              currentTimestamp.nanoseconds
            ),
          },
          collectionName,
          id: hash,
        });

        const confirmationText = `You have purchased a trending slot ${slot} for ${duration} hours.
Payment received of - \`${roundUpToDecimalPlace(amount, 4)}\` TON

Transaction hash for your payment is \`${hash}\`. Your token would be visible, and available to be scanned the next time the bot updates the trending message, so it may take a minute or two. In case of any doubts please reach out to the admins of the bot for any query.

Address Payment Received at - \`${sentTo}\``;

        if (isTrendingPayment) {
          const terminalResponse = apiFetcher<TokenPoolData>(
            `https://api.geckoterminal.com/api/v2/search/pools?query=${token}&network=ton&page=1`
          );
          const dexSResonse = apiFetcher<PairsData>(
            `${TOKEN_DATA_URL}/${token}`
          );

          const [terminalData, dexSData] = await Promise.all([
            terminalResponse,
            dexSResonse,
          ]);

          const terminalPool = terminalData.data.data?.at(0);
          const dexSPool = dexSData.data.pairs?.at(0);

          const name =
            terminalPool?.attributes.name.split("/").at(0) ||
            dexSPool?.baseToken.name;
          const pairAddress =
            terminalPool?.attributes.address || dexSPool?.pairAddress;

          if (name && pairAddress) {
            const terminalUrl = `https://www.geckoterminal.com/ton/pools/${pairAddress}`;
            const explorer = `https://tonviewer.com/${token}`;
            const buyLink = `https://app.ston.fi/swap`;
            const trendingLink = `https://t.me/c/2141872035/1159`;

            const text = `✅ New Token is Trending \\- ${name}

CA: \`${hardCleanUpBotMessage(token)}\`
Pool: \`${hardCleanUpBotMessage(pairAddress)}\`
Link: ${hardCleanUpBotMessage(socials)}
Ends in: ${duration} Hours

[GeckoTerminal](${terminalUrl}) \\| [Explorer](${explorer})
[Buy Token](${buyLink}) \\| [Trending](${trendingLink})`;

            teleBot.api
              .sendMessage(CHANNEL_ID || "", text, { parse_mode: "MarkdownV2" })
              .catch((e) => errorHandler(e));
          }
        }

        const syncFunc = isTrendingPayment ? syncToTrend : syncAdvertisements;

        if (isTrendingPayment) {
          apiPoster(`${TRENDING_TOKENS_API}/syncTrending`).catch((e) =>
            errorHandler(e)
          );
        } else {
          apiPoster(`${TRENDING_TOKENS_API}/syncAdvertisements`).catch((e) =>
            errorHandler(e)
          );
        }

        syncFunc()
          .then(() => {
            ctx.reply(cleanUpBotMessage(confirmationText), {
              parse_mode: "MarkdownV2",
            });
          })
          .then(() => {
            ctx.deleteMessage().catch((e) => errorHandler(e));
            ctx
              .deleteMessages([confirmingMessage.message_id])
              .catch((e) => errorHandler(e));
          })
          .catch((e) => errorHandler(e));

        // Splitting payment
        splitPayment(decryptedMnemonic, Number(balance));

        return true;
      } catch (error) {
        errorHandler(error);
        await sleep(30000);
      }
    }

    log(`Account for payment hash ${hash} not found`);
    const failedText = `Your payment wasn't confirmed. Please contact the admins and provide your payment hash - \`${hash}\``;

    ctx.reply(failedText).catch((e) => errorHandler(e));
  } catch (error) {
    errorHandler(error);
    ctx.reply(`An error occurred, please try again`);
  }
}
