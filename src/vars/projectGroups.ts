import { getDocument } from "@/firebase";
import { StoredGroup } from "@/types";
import { log } from "@/utils/handlers";
import { syncPairsToWatch } from "./pairsToWatch";

export let projectGroups: StoredGroup[] = [];

export async function syncProjectGroups() {
  projectGroups = await getDocument<StoredGroup>({
    collectionName: "project_groups",
  });

  syncPairsToWatch();

  log(`Synced project groups, ${projectGroups.length}`);
}
