export interface TransactionNotification {
  jsonrpc: string;
  method: string;
  params: {
    subscription: number;
    result: {
      transaction: {
        transaction: {
          signatures: string[];
          message: {
            accountKeys: {
              pubkey: string;
              writable: boolean;
              signer: boolean;
              source: string;
            }[];
            recentBlockhash: string;
            instructions: {
              programId: string;
              accounts?: string[];
              data?: string;
              stackHeight?: number | null;
              program?: string;
              parsed?: {
                info: {
                  [key: string]: any;
                };
                type: string;
              };
            }[];
            addressTableLookups: any[];
          };
        };
        meta: {
          err: null;
          status: { Ok: null };
          fee: number;
          preBalances: number[];
          postBalances: number[];
          innerInstructions: {
            index: number;
            instructions: {
              programId: string;
              accounts: string[];
              data: string;
              stackHeight: number;
            }[];
          }[];
          logMessages: string[];
          preTokenBalances: TokenBalance[];
          postTokenBalances: TokenBalance[];
          rewards: any[];
          computeUnitsConsumed: number;
        };
        version: number;
      };
      signature: string;
    };
  };
}

interface TokenBalance {
  accountIndex: number;
  mint: string;
  uiTokenAmount: {
    uiAmount: number;
    decimals: number;
    amount: string;
    uiAmountString: string;
  };
  owner: string;
  programId: string;
}
