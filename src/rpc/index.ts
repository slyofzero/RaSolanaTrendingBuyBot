import { TonClient } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { log } from "@/utils/handlers";

export let tonClient: TonClient = null as unknown as TonClient;

export async function rpcConfig() {
  const endpoint = await getHttpEndpoint({ network: "mainnet" });
  tonClient = new TonClient({ endpoint });
  log("Ton client ready");
}
