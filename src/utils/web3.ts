import { errorHandler, log } from "./handlers";
import { avgGasFees, workchain } from "./constants";
import { mnemonicNew, mnemonicToPrivateKey } from "ton-crypto";
import { tonClient } from "@/rpc";
import {
  Address,
  SendMode,
  WalletContractV4,
  internal,
  toNano,
} from "@ton/ton";
import { MAIN_ADDRESS } from "./env";
import { sleep } from "./time";

export function isValidTonAddress(address: string) {
  try {
    Address.parse(address).toRawString();
    return true;
  } catch (error) {
    return false;
  }
}

export async function generateAccount() {
  const mnemonic = await mnemonicNew();
  const keypair = await mnemonicToPrivateKey(mnemonic);
  const wallet = WalletContractV4.create({
    workchain,
    publicKey: keypair.publicKey,
  });

  const data = {
    publicKey: wallet.address.toString(),
    secretKey: mnemonic,
  };
  return data;
}

// export async function sendTransaction(
//   secretKey: string,
//   amount: number,
//   to?: string
// ) {
//   let attempts = 0;

//   try {
//     if (!to) {
//       return false;
//     }

//     attempts += 1;

//     const { lamportsPerSignature } = (
//       await solanaConnection.getRecentBlockhash("confirmed")
//     ).feeCalculator;

//     const secretKeyArray = new Uint8Array(JSON.parse(secretKey));
//     const account = web3.Keypair.fromSecretKey(secretKeyArray);
//     const toPubkey = new PublicKey(to);

//     const transaction = new web3.Transaction().add(
//       web3.SystemProgram.transfer({
//         fromPubkey: account.publicKey,
//         toPubkey,
//         lamports: amount - lamportsPerSignature,
//       })
//     );

//     const signature = await web3.sendAndConfirmTransaction(
//       solanaConnection,
//       transaction,
//       [account]
//     );
//     return signature;
//   } catch (error) {
//     log(`No transaction for ${amount} to ${to}`);
//     errorHandler(error);

//     if (attempts < 1) {
//       sendTransaction(secretKey, amount, to);
//     }
//   }
// }

export async function sendTransaction(
  secretKey: string[],
  amount: number,
  to: string,
  message?: string,
  sendMode?: SendMode,
  retryCount: number = 0
) {
  try {
    const keypair = await mnemonicToPrivateKey(secretKey);
    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keypair.publicKey,
    });
    const contract = tonClient.open(wallet);
    const seqno = await contract.getSeqno();
    const toAddress = Address.parse(to).toString({ urlSafe: true });

    if (!sendMode) amount = amount - avgGasFees;

    const args: any = {
      seqno,
      secretKey: keypair.secretKey,
      messages: [
        internal({
          to: toAddress,
          value: toNano(amount.toFixed(2)),
          body: message,
          bounce: false,
        }),
      ],
    };

    if (sendMode) {
      args.sendMode = sendMode;
    }

    await contract.sendTransfer(args);

    log(`Sent ${amount} to ${toAddress}, ${message}`);
    return true;
  } catch (error) {
    if (retryCount < 5) {
      // Check if retry count is less than 5
      errorHandler(error);
      log("Retrying...");
      await sleep(30000);
      // Retry with incremented retry count
      return sendTransaction(
        secretKey,
        amount,
        to,
        message,
        sendMode,
        retryCount + 1
      );
    } else {
      // If retry count exceeds 5, return false
      log("Retry limit exceeded. Transaction failed.");
      return false;
    }
  }
}

export async function splitPayment(
  secretKey: string[],
  totalPaymentAmount: number
) {
  if (!MAIN_ADDRESS) {
    return log(`No main address`);
  }

  try {
    await sendTransaction(
      secretKey,
      totalPaymentAmount,
      MAIN_ADDRESS,
      "Main Share",
      128
    ); // prettier-ignore
    log(`Main share ${totalPaymentAmount} sent`);
  } catch (error) {
    errorHandler(error);
  }
}
