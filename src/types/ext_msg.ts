// Stonfi
export interface StonfiExtDecodedBody {
  query_id: number;
  owner: string;
  exit_code: number;
  params: {
    is_right: boolean;
    value: {
      amount0_out: string;
      token0_address: string;
      amount1_out: string;
      token1_address: string;
    };
  };
}

export interface StonfiIntDecodedBody {
  query_id: number;
  to_address: string;
  sender_address: string;
  jetton_amount: string;
  min_out: string;
  has_ref_address: boolean;
  addrs: {
    from_user: string;
  };
}

// Dedust
interface Asset {
  sum_type: string;
  native: Record<string, unknown>;
  jetton: {
    workchain_id: number;
    address: string;
  };
  extra_currency: {
    currency_id: number;
  };
}

interface Field4 {
  sender_addr: string;
  referral_addr: string;
  reserve0: string;
  reserve1: string;
}

export interface DedustDecodedBody {
  asset_in: Asset;
  asset_out: Asset;
  amount_in: string;
  amount_out: string;
  field4: Field4;
}

// TXN Data
export interface TxnData {
  hash: string;
  pool: string;
  receiver: string;
  amountReceived: number;
  jettonWallet?: string;
  jetton?: string;
}
