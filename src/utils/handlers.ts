import { getNow } from "./time";

export function log(message: string) {
  // eslint-disable-next-line no-console
  console.log(message, getNow());
}

export function stopScript(message: string, exitCode?: number) {
  log(message);
  process.exit(exitCode || 1);
}
