export interface NewTransfer {
  sender: string;
  receiver: string;
  senderJettonWallet: string;
  receiverJettonWallet: string;
  amount: string;
  block: string;
  hash: string;
  parsed: boolean;
}
