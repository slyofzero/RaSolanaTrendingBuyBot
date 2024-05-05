/* eslint-disable */
interface TokenAmount {
  decimals: number;
  tokenAmount: string;
}

interface TokenBalanceChange {
  mint: string;
  rawTokenAmount: TokenAmount;
  tokenAccount: string;
  userAccount: string;
}

interface NativeTransfer {
  amount: number;
  fromUserAccount: string;
  toUserAccount: string;
}

interface TokenTransfer {
  fromTokenAccount: string;
  fromUserAccount: string;
  mint: string;
  toTokenAccount: string;
  toUserAccount: string;
  tokenAmount: number;
  tokenStandard: string;
}

interface Instructions {
  accounts: string[];
  data: string;
  innerInstructions: any[]; // Define innerInstructions structure if needed
  programId: string;
}

interface NativeOutput {
  account: string;
  amount: string;
}

interface SwapEvent {
  innerSwaps: any[]; // Define innerSwaps structure if needed
  nativeFees: any[]; // Define nativeFees structure if needed
  nativeInput: any; // Define nativeInput structure if needed
  nativeOutput: NativeOutput;
  tokenFees: any[]; // Define tokenFees structure if needed
  tokenInputs: TokenBalanceChange[];
  tokenOutputs: any[]; // Define tokenOutputs structure if needed
}

export interface TransactionData {
  accountData: any[]; // Define accountData structure if needed
  description: string;
  events: {
    swap: SwapEvent;
  };
  fee: number;
  feePayer: string;
  instructions: Instructions[];
  nativeTransfers: NativeTransfer[];
  signature: string;
  slot: number;
  source: string;
  timestamp: number;
  tokenTransfers: TokenTransfer[];
  transactionError: any; // Define transactionError structure if needed
  type: string;
}
