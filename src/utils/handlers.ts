import { nanoid } from "nanoid";
import { getNow } from "./time";
import { teleBot } from "..";
import { LOGS_CHANNEL_ID } from "./env";

export function log(...messages: any[]) {
  // eslint-disable-next-line no-console
  console.log(`[-----${getNow()}-----]`, ...messages);
}

export function stopScript(message: string, exitCode?: number) {
  log(message);
  process.exit(exitCode || 1);
}

export function errorHandler(e: unknown, showStack?: boolean) {
  const error = e as Error;
  log(`Error: ${error.message}`);
  if (showStack) log(error.stack);

  const errorCode = nanoid();
  const errorText = `Error - ${errorCode}\n${error.message}`;

  teleBot.api.sendMessage(LOGS_CHANNEL_ID || "", errorText);
}
