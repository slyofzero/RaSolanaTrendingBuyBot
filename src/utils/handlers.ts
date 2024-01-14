import { getNow } from "./time";

export function log(message: string) {
  const time = `[-----${getNow()}-----]`;
  // eslint-disable-next-line no-console
  console.log(time, message);
}

export function stopScript(message: string, exitCode?: number) {
  log(message);
  process.exit(exitCode || 1);
}

export function errorHandler(e: unknown) {
  const error = e as Error;
  log(`Error: ${error.message}`);
}
