import { Timestamp } from "firebase-admin/firestore";

export interface StoredAccount {
  id?: string;
  publicKey: string;
  secretKey: string;
  locked: boolean;
  lockedAt: Timestamp;
}
