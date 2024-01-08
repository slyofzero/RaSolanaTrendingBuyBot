import { getNow } from "./time";

export function log(message: string) {
  // eslint-disable-next-line no-console
  console.log(`[-----${getNow()}-----]`, message);
}

export function stopScript(message: string, exitCode?: number) {
  log(message);
  process.exit(exitCode || 1);
}
