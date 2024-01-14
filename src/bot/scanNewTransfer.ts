import { getJetton } from "@/tonWeb3";
import { NewTransfer } from "@/types/var";
import { cleanUpBotMessage, sendMessage } from "@/utils/bot";
import { log } from "@/utils/handlers";
import { client } from "..";
import { sleep } from "@/utils/time";
import { EXPLORER_URL } from "@/utils/env";
import { getDocument } from "@/firebase";
import { StoredGroup } from "@/types";

export async function scanNewTransfer(newTransfer: NewTransfer) {
  try {
    const { amount, receiver, hash } = newTransfer;
    const jetton = await getJetton(newTransfer.senderJettonWallet);

    const group =
      ((
        await getDocument({ collectionName: "project_groups", queries: [["jetton", "==", jetton]] })
      ).at(0) as StoredGroup) || undefined;

    if (!group) {
      return false;
    }

    const { chatId } = group;
    const { decimals, name, symbol } = (await client.jettons.getJettonInfo(jetton)).metadata;

    const receivedAmount = Math.floor(Number(amount) / 10 ** Number(decimals));
    const cleanedName = cleanUpBotMessage(name).replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const shortendReceiver = `${receiver.slice(0, 3)}...${receiver.slice(
      receiver.length - 3,
      receiver.length
    )}`;

    const text = `*${cleanedName} Buy!*
🟢🟢🟢🟢🟢
Got: ${receivedAmount} ${symbol}
Buyer: [${shortendReceiver}](${EXPLORER_URL}/${receiver})

[View Tx](${EXPLORER_URL}/transaction/${hash})`;
    // @ts-expect-error disable_web_page_preview not in type
    sendMessage(chatId, text, { disable_web_page_preview: true });
    return true;
  } catch (error) {
    log("Retrying notification");
    await sleep(1500);
    return await scanNewTransfer(newTransfer);
  }
}
