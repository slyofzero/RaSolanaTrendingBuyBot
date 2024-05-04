import { getNow } from "./time";

// eslint-disable-next-line
export function log(message: any) {
  const time = `[-----${getNow()}-----]`;
  // eslint-disable-next-line no-console
  console.log(time, message);
}

export function stopScript(message: string, exitCode?: number) {
  log(message);
  process.exit(exitCode || 1);
}

export function errorHandler(e: unknown, showStack?: boolean) {
  const error = e as Error;
  log(`Error: ${error.message}`);
  if (showStack) log(error.stack);
}
