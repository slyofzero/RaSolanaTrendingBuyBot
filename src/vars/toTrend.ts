import { getDocument } from "@/firebase";
import { StoredToTrend } from "@/types/trending";
import { log } from "@/utils/handlers";

// Related to paid trending tokens
export let allToTrend: StoredToTrend[] = [];
export let toTrendTokens: StoredToTrend[] = [];

export async function syncToTrend() {
  allToTrend = await getDocument<StoredToTrend>({
    collectionName: "to_trend",
    queries: [["status", "in", ["PAID", "MANUAL", "PENDING"]]],
  });

  toTrendTokens = allToTrend
    .sort((a, b) => a.slot - b.slot)
    .filter(({ status }) => ["PAID", "MANUAL"].includes(status));

  log(`Synced to_trend data`);
}
