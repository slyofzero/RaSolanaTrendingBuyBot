import WebSocket from "ws";
import { errorHandler, log, stopScript } from "@/utils/handlers";
import { WSS_ENDPOINT } from "@/utils/env";
import { client } from "..";
import { dedustTransfer, stonfiTransfer } from "./transferTxn";

export function subscribeAccount() {
  if (!WSS_ENDPOINT) {
    return stopScript("WSS endpoint is undefined");
  }
  const socket = new WebSocket(WSS_ENDPOINT);

  socket.addEventListener("open", () => {
    const subscribeMessage = {
      id: 1,
      jsonrpc: "2.0",
      method: "subscribe_block",
      params: ["workchain=0"],
    };

    log("WSS stream started");
    const messageString = JSON.stringify(subscribeMessage);
    socket.send(messageString);
  });

  socket.addEventListener("message", async (event) => {
    try {
      const receivedMessage = JSON.parse(event.data.toString());
      const { workchain, shard, seqno } = receivedMessage.params;
      const blockId = `(${workchain},${shard},${seqno})`;

      const transactions =
        await client.blockchain.getBlockchainBlockTransactions(blockId);

      for (const txn of transactions.transactions) {
        try {
          if (txn) {
            for (const outMsg of txn.out_msgs) {
              if (outMsg.decoded_op_name?.trim() === "stonfi_payment_request")
                stonfiTransfer(txn, outMsg);
              else if (outMsg.decoded_op_name?.trim() === "dedust_swap")
                dedustTransfer(txn, outMsg);
            }
          }
        } catch (error) {
          errorHandler(error);
          continue;
        }
      }
    } catch (e) {
      //
    }
  });

  socket.addEventListener("close", (event) => {
    const { code, reason, wasClean } = event;
    log(
      `WebSocket connection closed. Code: ${code}, Reason: ${reason}, Clean: ${wasClean}`
    );
    process.exit(1);
  });

  socket.addEventListener("error", (event) => {
    const { message } = event;
    log(`WebSocket connection closed. Message: ${message}`);
    process.exit(1);
  });
}
