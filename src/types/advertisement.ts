import { Timestamp } from "firebase-admin/firestore";

export interface StoredAdvertisement {
  id?: string;
  text: string;
  link: string;
  status: "PENDING" | "PAID" | "EXPIRED" | "MANUAL";
  hash: string;
  slot: number;
  duration: number;
  paidAt: Timestamp;
  sentTo: string;
  amount: number;
  expiresAt?: Timestamp;
  initiatedBy: number;
  username: string;
}
