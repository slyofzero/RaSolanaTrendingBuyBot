import web3, { PublicKey } from "@solana/web3.js";
import { ethers } from "ethers";
import nacl from "tweetnacl";
import { errorHandler, log } from "./handlers";
import { solanaConnection } from "@/rpc/config";

export function isValidSolAddress(address: string) {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
}

export function generateAccount() {
  const randomBytes = ethers.utils.randomBytes(32);
  const mnemonic = ethers.utils.entropyToMnemonic(randomBytes);
  const seed = ethers.utils.mnemonicToSeed(mnemonic);
  const hex = Uint8Array.from(Buffer.from(seed));
  const keyPair = nacl.sign.keyPair.fromSeed(hex.slice(0, 32));
  const { publicKey, secretKey } = new web3.Keypair(keyPair);
  const data = {
    publicKey: publicKey.toString(),
    secretKey: `[${secretKey.toString()}]`,
  };
  return data;
}

export async function sendTransaction(
  secretKey: string,
  amount: number,
  to?: string
) {
  let attempts = 0;

  try {
    if (!to) {
      return false;
    }

    attempts += 1;

    const { lamportsPerSignature } = (
      await solanaConnection.getRecentBlockhash("confirmed")
    ).feeCalculator;

    const secretKeyArray = new Uint8Array(JSON.parse(secretKey));
    const account = web3.Keypair.fromSecretKey(secretKeyArray);
    const toPubkey = new PublicKey(to);

    const transaction = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: account.publicKey,
        toPubkey,
        lamports: amount - lamportsPerSignature,
      })
    );

    const signature = await web3.sendAndConfirmTransaction(
      solanaConnection,
      transaction,
      [account]
    );
    return signature;
  } catch (error) {
    log(`No transaction for ${amount} to ${to}`);
    errorHandler(error);

    if (attempts < 1) {
      sendTransaction(secretKey, amount, to);
    }
  }
}

export async function getTokenBalance(ownerAddress: string, token: string) {
  try {
    const ownerPublicKey = new PublicKey(ownerAddress);
    const tokenPublicKey = new PublicKey(token);

    const balance = await solanaConnection.getParsedTokenAccountsByOwner(
      ownerPublicKey,
      {
        mint: tokenPublicKey,
      }
    );

    const tokenBalance =
      balance.value[0]?.account.data.parsed.info.tokenAmount.uiAmount;
    return Number(tokenBalance?.toFixed(2));
  } catch (error) {
    errorHandler(error);
    return 0;
  }
}
