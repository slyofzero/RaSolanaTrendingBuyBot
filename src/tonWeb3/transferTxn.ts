import { sendAlert } from "@/bot/sendAlert";
import { DedustDecodedBody, StonfiExtDecodedBody, TxnData } from "@/types";
import { errorHandler } from "@/utils/handlers";
import { Message, Transaction } from "tonapi-sdk-js";

export function stonfiTransfer(txn: Transaction, outMsg: Message) {
  const pool = txn.account.address;
  const extDecodedBody = outMsg?.decoded_body as StonfiExtDecodedBody;
  const receiver = extDecodedBody.owner;
  const decodedValue = extDecodedBody.params.value;

  const amount0_out = Number(decodedValue.amount0_out);
  const amount1_out = Number(decodedValue.amount1_out);
  const amountReceived = amount0_out > 0 ? amount0_out : amount1_out;
  const jettonWallet =
    amount0_out > 0 ? decodedValue.token0_address : decodedValue.token1_address;

  if (amountReceived > 0) {
    const txnData: TxnData = {
      hash: txn.hash,
      pool,
      receiver,
      amountReceived,
      jettonWallet,
    };
    sendAlert(txnData);
  }
}

export function dedustTransfer(txn: Transaction, outMsg: Message) {
  try {
    const decodedBody = outMsg?.decoded_body as DedustDecodedBody;
    const jetton = Object.values(decodedBody.asset_out?.jetton || {}).join(":");

    if (!jetton) return;

    const { amount_out } = decodedBody;
    const receiver = decodedBody.field4.sender_addr;

    const txnData: TxnData = {
      amountReceived: Number(amount_out),
      hash: txn.hash,
      jetton,
      receiver,
      pool: txn.account.address,
    };

    sendAlert(txnData);
  } catch (error) {
    errorHandler(error);
  }
}
