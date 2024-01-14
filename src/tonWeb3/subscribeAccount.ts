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

  // const newTransfer: NewTransfer = {
  //   amount: "10000000000",
  //   block: "(0,8000000000000000,17370624)",
  //   hash: "95c85a466cabb62406388ab956368f24c1b65d788bc80c3dd0d20de73482b827",
  //   parsed: false,
  //   receiver: "0:7cb3026fb57d838df4a334123ef3a6b8188e98ce8062471c9f5e20e0c7708b6e",
  //   receiverJettonWallet: "0:7cbb01216bf79cc608d3ce90059db1161aabd15b41cd56199e563ac4076a6c8d",
  //   sender: "0:d08c83c67d739881784aaefb3b65ead24702f64ba69bdf5293ba63914e152c5b",
  //   senderJettonWallet: "0:8aa5e09b6a8cde8ce867fc303047c7dd9b22be6ce4bbd503f7d58a2f17d78fe8",
  // };
  // scanNewTransfers(newTransfer);

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
