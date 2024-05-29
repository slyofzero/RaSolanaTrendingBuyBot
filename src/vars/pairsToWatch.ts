import { log } from "@/utils/handlers";
import { trendingTokens } from "./trendingTokens";
import { projectGroups } from "./projectGroups";

export let pairsToWatch: string[] = [];

export async function syncPairsToWatch() {
  pairsToWatch = Object.values(trendingTokens);
  projectGroups.forEach(({ pairs }) => pairsToWatch.push(...pairs));
  log(`Synced all pairs to watch`);
}
