import { TokenMetaData, TokenPoolData } from "@/types/terminalData";
import { apiFetcher } from "@/utils/api";
import { GECKO_API } from "@/utils/env";
import { log } from "@/utils/handlers";
import { Address } from "@ton/ton";

export async function scanToken(address: string) {
  const friendlyAddress = Address.parseRaw(address).toString();
  const tokenInfo = (
    await apiFetcher<TokenPoolData>(
      `${GECKO_API}/networks/ton/tokens/${friendlyAddress}/pools?page=1`
    )
  ).data.data;

  if (!tokenInfo) {
    log(`Token info not found for ${friendlyAddress}`);
    return false;
  }
  const topPool = tokenInfo.at(0);
  if (!topPool) {
    log(`Top pool not found for ${friendlyAddress}`);
    return false;
  }

  const metaData = (
    await apiFetcher<TokenMetaData>(`${GECKO_API}/networks/ton/tokens/${friendlyAddress}`)
  ).data?.data?.attributes;

  if (!metaData) {
    log(`Metadata not found for ${friendlyAddress}`);
    return false;
  }

  return true;
}
