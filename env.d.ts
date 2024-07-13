declare global {
  namespace NodeJS {
    interface ProcessEnv {
      RPC_ENDPOINT: string | undefined;
      TRENDING_TOKENS_API: string | undefined;
      TRENDING_AUTH_KEY: string | undefined;
      BOT_TOKEN: string | undefined;
      TRENDING_CHANNEL_LINK: string | undefined;
      BOT_USERNAME: string | undefined;
      TRENDING_BOT_USERNAME: string | undefined;
      TRENDING_CHANNEL_ID: string | undefined;
      ENCRYPTION_KEY: string | undefined;
      PORT: string | undefined;
      LOGS_CHANNEL_ID: string | undefined;
      TRENDING_BOT_TOKENS: string | undefined;
      FIREBASE_KEY: string | undefined;
    }
  }
}

export {};
