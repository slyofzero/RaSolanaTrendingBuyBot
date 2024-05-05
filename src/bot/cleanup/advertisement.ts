import { updateDocumentById } from "@/firebase";
import { transactionValidTime } from "@/utils/constants";
import { errorHandler, log } from "@/utils/handlers";
import { getSecondsElapsed } from "@/utils/time";
import { allAdvertisements, syncAdvertisements } from "@/vars/advertisements";

export async function cleanUpPendingAdvertisements() {
  for (const ad of allAdvertisements) {
    try {
      const { paidAt, expiresAt, id, status } = ad;

      const secondsTillPaymentGeneration = getSecondsElapsed(paidAt.seconds);
      const currentTime = Math.floor(new Date().getTime() / 1e3);

      if (
        (secondsTillPaymentGeneration > transactionValidTime &&
          status === "PENDING") ||
        (expiresAt &&
          currentTime > expiresAt?.seconds &&
          (status === "PAID" || status == "MANUAL"))
      ) {
        await updateDocumentById({
          updates: { status: "EXPIRED" },
          collectionName: "advertisements",
          id: id || "",
        });
        log(`Advertisement ${id} expired`);

        await syncAdvertisements();
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
