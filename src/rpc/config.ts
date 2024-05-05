import { RPC_ENDPOINT } from "@/utils/env";
import { log } from "@/utils/handlers";
import { Connection } from "@solana/web3.js";

export let solanaConnection: Connection = null as unknown as Connection;

export function rpcConfig() {
  if (!RPC_ENDPOINT) {
    log("RPC endpoint is undefined");
  }
  solanaConnection = new Connection(RPC_ENDPOINT || "");
  log("RPC configured");
}
