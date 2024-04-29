import { PairData } from "./pairData";
import { Timestamp } from "firebase-admin/firestore";

export interface TrendingData extends PairData {
  socials?: string;
}

export type TrendingTokens = [string, TrendingData][];
export interface StoredToTrend {
  id?: string;
  token: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "MANUAL";
  hash: string;
  slot: 1 | 2 | 3;
  duration: number;
  sentTo: string;
  amount: number;
  paidAt: Timestamp;
  expiresAt?: Timestamp;
  initiatedBy: number;
  username: string;
  socials: string;
  emoji: string;
  gif: string;
}
