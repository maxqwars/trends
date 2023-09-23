declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL: string;
      VK_SERVICE_TOKEN: string;
      MEMCACHED_URL: string;
      MEMCACHED_LIFETIME: string;
      VK_USER_TOKEN: string;
      UI_PORT: string;
      TELEGRAM_PUSH_UNIT_URL: string;
      TELEGRAM_PUSH_EMIT_KEY: string;
      TELEGRAM_PUSH_SUBSCRIBE_KEY: string;
      TELEGRAM_BOT_TOKEN: string;
      DATABASE_URL: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
