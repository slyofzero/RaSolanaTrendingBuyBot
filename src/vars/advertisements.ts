import { getDocument } from "@/firebase";
import { StoredAdvertisement } from "@/types/advertisement";
import { log } from "@/utils/handlers";

export let allAdvertisements: StoredAdvertisement[] = [];
export let advertisements: StoredAdvertisement[] = [];

export async function syncAdvertisements() {
  allAdvertisements = await getDocument<StoredAdvertisement>({
    collectionName: "advertisements",
    queries: [["status", "in", ["PAID", "MANUAL"]]],
  });

  advertisements = allAdvertisements
    .sort((a, b) => a.slot - b.slot)
    .filter(({ status }) => ["PAID", "MANUAL"].includes(status));

  log("Synced advertisements with firebase");
}
