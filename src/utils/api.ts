import fs from "fs";
import { pipeline } from "stream/promises";
import { errorHandler, log } from "./handlers";
import path from "path";

export async function apiFetcher<T>(url: string) {
  const response = await fetch(url);
  const data = (await response.json()) as T;
  return { response: response.status, data };
}

export async function downloadFile(url: string, outputPath: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file. Status: ${response.status} ${response.statusText}`);
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
