import { getJetton } from "@/tonWeb3";
import { NewTransfer } from "@/types/var";
import { cleanUpBotMessage, sendMessage } from "@/utils/bot";
import { errorHandler, log } from "@/utils/handlers";
import { client } from "..";
import { sleep } from "@/utils/time";
import { DEX_URL, EXPLORER_URL } from "@/utils/env";
import { getDocument } from "@/firebase";
import { StoredGroup } from "@/types";

export async function scanNewTransfer(newTransfer: NewTransfer) {
  try {
    const { amount, receiver, hash } = newTransfer;
    const jetton = await getJetton(newTransfer.senderJettonWallet);

    const groups = (await getDocument({
      collectionName: "project_groups",
      queries: [["jetton", "==", jetton]],
    })) as StoredGroup[];

    if (!groups.length) {
      return false;
    }

    for (const group of groups) {
      const { chatId } = group;
      const { decimals, name, symbol } = (await client.jettons.getJettonInfo(jetton)).metadata;

      const receivedAmount = parseFloat((Number(amount) / 10 ** Number(decimals)).toFixed(3));
      const cleanedName = cleanUpBotMessage(name).replace(/\(/g, "\\(").replace(/\)/g, "\\)");
      const shortendReceiver = `${receiver.slice(0, 3)}...${receiver.slice(
        receiver.length - 3,
        receiver.length
      )}`;
      const swapUrl = `${DEX_URL}/swap?chartVisible=true&tt=TON&ft=${symbol}`;
      let emojiCount = 0;

      if (receivedAmount <= 10) {
        emojiCount = 3;
      } else if (receivedAmount <= 100) {
        emojiCount = 7;
      } else if (receivedAmount <= 500) {
        emojiCount = 12;
      } else {
        emojiCount = 20;
      }
      const greenEmojis = "🟢".repeat(emojiCount);

      const text = `*${cleanedName} Buy!*
${greenEmojis}

🤑 Got: ${receivedAmount.toString()} ${symbol}
👤 Buyer: [${shortendReceiver}](${EXPLORER_URL}/${receiver})

✨ [View Tx](${EXPLORER_URL}/transaction/${hash})
[📊 Chart \\| 🔀 Swap](${swapUrl})`;
      // @ts-expect-error disable_web_page_preview not in type
      sendMessage(chatId, text, { disable_web_page_preview: true });
    }

    return true;
  } catch (error) {
    log("Retrying notification");
    errorHandler(error);

    await sleep(1500);
    return await scanNewTransfer(newTransfer);
  }
}
