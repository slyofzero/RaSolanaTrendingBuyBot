import { BuyData, sendAlert } from "./bot/sendAlert";
import { TransactionNotification } from "./types";
import { memoTokenData } from "./vars/tokens";

export async function parseTxn(data: TransactionNotification) {
  const { transaction: transactionResult, signature } = data.params.result;
  const { meta, transaction } = transactionResult;
  const { preTokenBalances, postTokenBalances } = meta;

  const signer = transaction.message.accountKeys
    .find(({ signer }) => signer)
    ?.pubkey.toString();

  if (!signer) return;

  const signersPreTokenBalances = preTokenBalances.filter(
    ({ owner }) => owner === signer
  );

  for (const preTokenBalance of signersPreTokenBalances) {
    const { owner, mint, uiTokenAmount } = preTokenBalance;
    const token = Object.keys(memoTokenData).find((token) => token === mint);
    if (!token) continue;

    const preBalance = uiTokenAmount.uiAmount;
    const postBalances = postTokenBalances.filter(
      ({ owner: postOwner, mint }) => postOwner === owner && mint === token
    );
    for (const balance of postBalances) {
      const { uiTokenAmount } = balance;
      if (uiTokenAmount.uiAmount > preBalance) {
        const amount = parseFloat(
          (uiTokenAmount.uiAmount - preBalance).toFixed(2)
        );
        const change = !preBalance
          ? 0
          : parseFloat(((amount / preBalance) * 100).toFixed(2));
        const buyData: BuyData = {
          buyer: signer,
          amount,
          token,
          change,
          signature,
        };

        sendAlert(buyData);
      }
    }
  }
}
