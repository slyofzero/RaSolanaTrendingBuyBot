import { getDocument } from "@/firebase";
import { BotCallbackContextType, StoredWallet } from "@/types";
import { sendMessage } from "@/utils/bot";

export async function walletCallback(ctx: BotCallbackContextType) {
  const chatId = ctx.chat?.id || "";
  const { id: userId } = ctx.from;

  const callbackInformMessage = "Getting your wallet data...";
  sendMessage(chatId, callbackInformMessage);

  const userWallet = (
    await getDocument({
      collectionName: "wallets",
      queries: [["owner", "==", userId]],
    })
  ).at(0) as StoredWallet | undefined;
}
