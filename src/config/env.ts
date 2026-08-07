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

function getTelegramChannelId(): string {
  const value = getEnv('TELEGRAM_CHANNEL_ID');

  if (/^-100\d+$/.test(value) || /^@[a-zA-Z0-9_]+$/.test(value)) {
    return value;
  }

  throw new Error(
    'Environment variable TELEGRAM_CHANNEL_ID must be a full channel ID (-100...) or @username',
  );
}

function getTelegramChannelUrl(): string {
  const value = getEnv('TELEGRAM_CHANNEL_URL');

  try {
    const url = new URL(value);

    if (url.protocol === 'https:' && url.hostname === 't.me' && url.pathname !== '/') {
      return value;
    }
  } catch {
    // The validation error below describes the expected format.
  }

  throw new Error(
    'Environment variable TELEGRAM_CHANNEL_URL must be a complete https://t.me/... link',
  );
}

export const env = {
  botToken: getEnv('BOT_TOKEN'),
  botEnabled: getBooleanEnv('BOT_ENABLED', true),
  telegramProxyUrl: getOptionalEnv('TELEGRAM_PROXY_URL'),
  telegramChannelId: getTelegramChannelId(),
  telegramChannelUrl: getTelegramChannelUrl(),

  adminChatId: getEnv('ADMIN_CHAT_ID'),
  webAppUrl: getEnv('WEB_APP_URL'),

  databaseUrl: getEnv('DATABASE_URL'),
  shadowDatabaseUrl: getEnv('SHADOW_DATABASE_URL'),

  apiPort: getNumberEnv('API_PORT', 3000),
};
