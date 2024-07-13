import { trendingMessageId } from "@/vars/message";
import { TRENDING_CHANNEL } from "./env";

export const firebaseCollectionPrefix = "_ra_solana_bot";

export const urlRegex =
  /^(?:https?|ftp):\/\/(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w-]*)*\/?(?:\?[^#\s]*)?$/;
export const transactionValidTime = 25 * 60;
export const buyLimit = 100;
export const TRENDING_MSG = `${TRENDING_CHANNEL}/${trendingMessageId}`;
