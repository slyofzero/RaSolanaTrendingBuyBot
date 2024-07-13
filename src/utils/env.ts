import dotenv from "dotenv";

export const { NODE_ENV } = process.env;
dotenv.config({
  path: NODE_ENV === "development" ? ".env" : ".env.production",
});

export const {
  BOT_TOKEN,
  BOT_USERNAME,
  ENCRYPTION_KEY,
  LOGS_CHANNEL_ID,
  PORT,
  RPC_ENDPOINT,
  TRENDING_AUTH_KEY,
  TRENDING_BOT_USERNAME,
  TRENDING_CHANNEL_ID,
  TRENDING_TOKENS_API,
  FIREBASE_KEY,
  TRENDING_CHANNEL_LINK,
} = process.env;

export const TRENDING_BOT_TOKENS: string[] = JSON.parse(
  process.env.TRENDING_BOT_TOKENS || "[]"
);
