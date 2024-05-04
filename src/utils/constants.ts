import { Address } from "@ton/ton";
import { AD_PRICES, TRENDING_PRICES } from "./env";

export const firebaseCollectionPrefix = "_insect_buy_bot";

export const defaultBuyGif =
  "BAACAgUAAx0Ef6pfowACL0RmLjjEQ8k-j8XrmlfbFxD9zhKEbgACtA4AAo5ZcFWQUmJZiWQE0DQE";

export const whitelistedPools = [
  // "EQBCwe_IObXA4Mt3RbcHil2s4-v4YQS3wUDt1-DvZOceeMGO",
  // "EQCBwglxhJgTue5tMPX4KE0O1it4dNjD_f53WM8asjgMiSYx",
  // "EQAoB_Eu83hGRiJ5WFnLn77m98TCNYNfhhE4AUuNNFAzsSkV",
  // "EQCO9NDT4Il25_4ZpHIOgMAUbRJvpsI9pLzqhD8X7eTVB7X_",
  "EQAE0eK1xx3CfQIrqxTxLsI0Nd-nKhDBW3cp-mNVZWOn_MT5",
  "EQDlxf_1othGgTZihxp3CZspogqctK8FEbVIDAa9NmTa7383",
].map((address) => Address.parse(address).toRawString());

export const bannedTokens = [
  "0:8cdc1d7640ad5ee326527fc1ad0514f468b30dc84b0173f0e155f451b4e11f7c",
];

export const trendingIcons = [
  "🥇",
  "🥈",
  "🥉",
  "4️⃣",
  "5️⃣",
  "6️⃣",
  "7️⃣",
  "8️⃣",
  "9️⃣",
  "🔟",
  "1️⃣1️⃣",
  "1️⃣2️⃣",
  "1️⃣3️⃣",
  "1️⃣4️⃣",
  "1️⃣5️⃣",
  "1️⃣6️⃣",
  "1️⃣7️⃣",
  "1️⃣8️⃣",
  "1️⃣9️⃣",
  "2️⃣0️⃣",
];
export const workchain = 0;
export const avgGasFees = 0.025;

export const trendPrices: { [K in 1 | 2 | 3]: { [key: number]: number } } =
  JSON.parse(TRENDING_PRICES || "");
export const adPrices: { [key: number]: number } = JSON.parse(AD_PRICES || "");
export const urlRegex =
  /^(?:https?|ftp):\/\/(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/[\w-]*)*\/?(?:\?[^#\s]*)?$/;
export const transactionValidTime = 25 * 60;
