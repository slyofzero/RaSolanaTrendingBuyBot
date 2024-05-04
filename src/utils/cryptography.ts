import crypto from "crypto";
import { ENCRYPTION_KEY } from "./env";
import { stopScript } from "./handlers";

export function encrypt(item: string) {
  if (!ENCRYPTION_KEY) {
    stopScript("ENCRYPTION_KEY is undefined");
    return "";
  }

  const cipher = crypto.createCipher("aes-256-ctr", ENCRYPTION_KEY);
  const encryptedPrivateKey = Buffer.concat([
    cipher.update(item, "utf8"),
    cipher.final(),
  ]).toString("hex");

  return encryptedPrivateKey;
}

export function decrypt(encryptedItem: string) {
  if (!ENCRYPTION_KEY) {
    stopScript("ENCRYPTION_KEY is undefined");
    return "";
  }

  const decipher = crypto.createDecipher("aes-256-ctr", ENCRYPTION_KEY);
  const decryptedPrivateKey = Buffer.concat([
    decipher.update(Buffer.from(encryptedItem, "hex")),
    decipher.final(),
  ]).toString();

  return decryptedPrivateKey;
}
