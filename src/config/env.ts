import dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name];

  if (!value) {
    return undefined;
  }

  return value;
}

function getBooleanEnv(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  return value.toLowerCase() === 'true';
}

function getNumberEnv(name: string, defaultValue: number): number {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return parsedValue;
}

export const env = {
  botToken: getEnv('BOT_TOKEN'),
  botEnabled: getBooleanEnv('BOT_ENABLED', true),
  telegramProxyUrl: getOptionalEnv('TELEGRAM_PROXY_URL'),

  adminChatId: getEnv('ADMIN_CHAT_ID'),
  webAppUrl: getEnv('WEB_APP_URL'),

  databaseUrl: getEnv('DATABASE_URL'),
  shadowDatabaseUrl: getEnv('SHADOW_DATABASE_URL'),

  apiPort: getNumberEnv('API_PORT', 3000),
};