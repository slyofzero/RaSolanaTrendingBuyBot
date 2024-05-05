import { updateDocumentById } from "@/firebase";
import { transactionValidTime } from "@/utils/constants";
import { errorHandler, log } from "@/utils/handlers";
import { getSecondsElapsed } from "@/utils/time";
import { allToTrend, syncToTrend } from "@/vars/trending";

export async function cleanUpPendingToTrend() {
  for (const trend of allToTrend) {
    try {
      const { paidAt, expiresAt, id, status } = trend;

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
          collectionName: "to_trend",
          id: id || "",
        });
        log(`Trend ${id} expired`);

        await syncToTrend();
      }
    } catch (error) {
      errorHandler(error);
    }
  }
}
