export function getNow() {
  return new Date().toISOString();
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getNowTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export function getSecondsElapsed(timestamp: number) {
  return getNowTimestamp() - timestamp;
}

export async function recurse(func: any, ms: number) {
  await sleep(ms);
  await func();
  recurse(func, ms);
}
