import { Timestamp } from "firebase-admin/firestore";

export interface StoredTrending {
  id?: string;
  token: string;
  user: number;
  rank: number;
  duration: number;
  amount: number;
  paymentInitiatedAt: Timestamp;
  paymentAccount: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "MANUAL";
  trendExpiryTimestamp?: Timestamp;
}
