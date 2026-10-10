export interface AppConfig {
  port: number;
  host: string;
  nodeEnv: string;
  databaseUrl: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  aiModelName: string;
  wsHeartbeatIntervalMs: number;
}

export const appConfig: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres_password@localhost:5432/multilingual_chat',
  defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
  supportedLanguages: (process.env.SUPPORTED_LANGUAGES || 'uz,ru,en,es,fr,de,tr,zh').split(','),
  aiModelName: process.env.AI_MODEL_NAME || 'gemini-2.5-flash',
  wsHeartbeatIntervalMs: parseInt(process.env.WS_HEARTBEAT_INTERVAL_MS || '30000', 10),
};
