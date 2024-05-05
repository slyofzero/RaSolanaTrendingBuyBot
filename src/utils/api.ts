import fs from "fs";
import { pipeline } from "stream/promises";
import { errorHandler, log } from "./handlers";
import path from "path";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

export async function apiFetcher<T>(
  url: string,
  headers?: Record<string, string>
) {
  const options: RequestInit = {
    headers: {
      ...(headers || {}),
    },
  };

  const response = await fetch(url, options);

  const data = (await response.json()) as T;
  return { response: response.status, data };
}

export async function apiPoster<T>(url: string) {
  const response = await fetch(url, { method: "POST" });
  const data = (await response.json()) as T;
  return { response: response.status, data };
}

export async function downloadFile(url: string, outputPath: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to download file. Status: ${response.status} ${response.statusText}`
      );
    }

    const filePath = path.join(process.cwd(), "public", "gifs", outputPath);
    const fileStream = fs.createWriteStream(filePath);
    const { body } = response;
    if (!body) {
      log("File download body empty");
      return false;
    }

    // @ts-expect-error Body type error
    await pipeline(body, fileStream);
    log(`File downloaded successfully to ${outputPath}`);

    return filePath;
  } catch (error) {
    errorHandler(error);
  }
}

export async function getTickerPrice(ticker: string) {
  interface Price {
    symbol: string;
    price: string;
  }

  const priceData = await apiFetcher<Price>(
    `https://api.binance.com/api/v3/ticker/price?symbol=${ticker}`
  );
  return Number(priceData.data.price);
}

export async function getTokenMetaData(token: string) {
  try {
    const connection = new Connection("https://api.mainnet-beta.solana.com");
    const metaplex = Metaplex.make(connection);

    const mintAddress = new PublicKey(token);

    const metadataAccount = metaplex
      .nfts()
      .pdas()
      .metadata({ mint: mintAddress });

    const metadataAccountInfo = await connection.getAccountInfo(
      metadataAccount
    );

    if (!metadataAccountInfo) {
      throw Error("Metadata account not found");
    }

    const tokenData = await metaplex
      .nfts()
      .findByMint({ mintAddress: mintAddress });

    return tokenData;
  } catch (error) {
    return undefined;
  }
}
