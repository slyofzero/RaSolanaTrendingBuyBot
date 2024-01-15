import WebSocket from "ws";
import { NewTransfer } from "@/types/var";
import { log, stopScript } from "@/utils/handlers";
import { WSS_ENDPOINT } from "@/utils/env";
import { client } from "..";
import { Address } from "@ton/ton";
import { addNewTransfer } from "@/vars/newTransfers";

// Configure the HTTP client with your host and token

export async function subscribeAccount() {
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

      const transactions = await client.blockchain.getBlockchainBlockTransactions(blockId);

      for (const transaction of transactions.transactions) {
        if (transaction) {
          for (const out_msg of transaction.out_msgs) {
            if (out_msg.decoded_op_name?.trim() === "jetton_internal_transfer") {
              const hash = transaction.hash;

              const sender = Address.parseRaw(
                transaction.in_msg?.decoded_body?.response_destination
              ).toString();
              const receiver = Address.parseRaw(
                transaction.in_msg?.decoded_body?.destination
              ).toString();

              const receiverJettonWallet = Address.parseRaw(
                out_msg.destination?.address || ""
              ).toString();
              const senderJettonWallet = Address.parseRaw(out_msg.source?.address || "").toString();

              const amount = out_msg.decoded_body?.amount;
              const block = transaction.block;

              if (receiverJettonWallet && senderJettonWallet) {
                const newTransfer: NewTransfer = {
                  amount,
                  block,
                  hash,
                  parsed: false,
                  receiver,
                  receiverJettonWallet,
                  sender,
                  senderJettonWallet,
                };

                addNewTransfer(newTransfer);
                log(`Transaction ${hash} added to new transfers`);
              }
            }
          }
        }
      }
    } catch (e) {
      //
    }
  });

  socket.addEventListener("close", (event) => {
    log(`WebSocket connection closed: ${event}`);
  });

  socket.addEventListener("error", (event) => {
    log(`WebSocket error: ${event}`);
  });
}
