import dotenv from "dotenv";
dotenv.config();

export const {
  BOT_TOKEN,
  FIREBASE_KEY,
  HTTP_CLIENT,
  WSS_ENDPOINT,
  BOT_USERNAME,
  TONCLIENT_ENDPOINT,
  EXPLORER_URL,
} = process.env;
