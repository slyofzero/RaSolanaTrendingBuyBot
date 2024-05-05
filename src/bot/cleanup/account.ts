import { getDocument, updateDocumentById } from "@/firebase";
import { tonClient } from "@/rpc";
import { StoredAccount } from "@/types";
import { errorHandler } from "@/utils/handlers";
import { Address } from "@ton/ton";

export async function unlockUnusedAccounts() {
  const lockedAccounts = (await getDocument({
    collectionName: "accounts",
    queries: [["locked", "==", true]],
  })) as StoredAccount[];

  for (const { id, publicKey } of lockedAccounts) {
    try {
      const balance = await tonClient.getBalance(Address.parse(publicKey));

      if (balance === 0n) {
        updateDocumentById({
          updates: { locked: false, lockedAt: null },
          collectionName: "accounts",
          id: id || "",
        });
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
