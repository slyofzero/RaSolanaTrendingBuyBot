import { scanNewTransfer } from "@/bot";
import { NewTransfer } from "@/types/var";
import { log } from "@/utils/handlers";

export let newTransfers: NewTransfer[] = [];

export function addNewTransfer(newTransfer: NewTransfer) {
  newTransfers.push(newTransfer);
}

export async function checkNewTransfer() {
  log(`Checking for new transfers, got - ${newTransfers.length}`);

  for (const [index, transfer] of newTransfers.entries()) {
    const parsed = await scanNewTransfer(transfer);
    const transferToUpdate = newTransfers.at(index);

    if (transferToUpdate) {
      transferToUpdate.parsed = Boolean(parsed);
    }
  }

  // Removing all parsed transfers
  newTransfers = [];

  log("New transfers cleaned up");
}
