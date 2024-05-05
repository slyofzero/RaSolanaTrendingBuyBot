import { getDocument } from "@/firebase";
import { StoredGroup } from "@/types";
import { log } from "@/utils/handlers";

export let trackedTokens: string[] = [];

export function addTrackedToken(token: string) {
  trackedTokens.push(token);
}

export async function syncTrackedTokens() {
  const rows = await getDocument<StoredGroup>({
    collectionName: "project_groups",
  });
  trackedTokens = rows.map(({ token }) => token);
  log("Synced trackedTokens with PG");
}
