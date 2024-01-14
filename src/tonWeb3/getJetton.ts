import { Address } from "@ton/ton";
import { tonClient } from "..";

export async function getJetton(rawAddress: string) {
  const methodData = await tonClient.runMethod(Address.parse(rawAddress), "get_wallet_data");
  methodData.stack.pop();
  methodData.stack.pop();
  const jetton = methodData.stack.readAddress().toString();
  const rawJettonAddress = Address.parse(jetton).toRawString();

  return rawJettonAddress;
}
