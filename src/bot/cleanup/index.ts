import { cleanUpPendingAdvertisements } from "./advertisement";
import { cleanUpPendingToTrend } from "./trend";

export async function cleanUpExpired() {
  await Promise.all([cleanUpPendingAdvertisements(), cleanUpPendingToTrend()]);
}
