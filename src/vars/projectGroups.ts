import { getDocument } from "@/firebase";
import { StoredGroup } from "@/types";
import { log } from "@/utils/handlers";

export let projectGroups: StoredGroup[] = [];

export async function syncProjectGroups() {
  projectGroups = await getDocument<StoredGroup>({
    collectionName: "project_groups",
  });

  log(`Synced project groups, ${projectGroups.length}`);
}
