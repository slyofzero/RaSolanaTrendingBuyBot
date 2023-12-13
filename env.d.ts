declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DEX_URL: string | undefined;
    }
  }
}

export {};
