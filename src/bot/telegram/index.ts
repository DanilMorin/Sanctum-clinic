import { Telegraf } from 'telegraf-hardened';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { handleStartCommand } from './commands/start.command.js';
import { registerQuizHandlers } from './handlers/quiz.handler.js';

export function createTelegramBot(): Telegraf {
  const proxyAgent = env.telegramProxyUrl
    ? new ProxyAgent(env.telegramProxyUrl)
    : null;
  const telegramFetch = proxyAgent
    ? (async (url: URL | string, options?: RequestInit) =>
        (await undiciFetch(url.toString(), {
          ...options,
          dispatcher: proxyAgent,
        } as Parameters<typeof undiciFetch>[1])) as unknown as Response)
    : undefined;

  const bot = new Telegraf(env.botToken, {
    telegram: telegramFetch
      ? {
          fetch: telegramFetch,
          requestTimeout: 60_000,
        }
      : undefined,
  });

  bot.start(handleStartCommand);

  registerQuizHandlers(bot);

  bot.catch((error) => {
    logger.error('Telegram bot error', error);
  });

  return bot;
}

export async function startTelegramBot(): Promise<Telegraf | null> {
  if (!env.botEnabled) {
    logger.warn('Telegram bot is disabled by BOT_ENABLED=false');

    return null;
  }

  const bot = createTelegramBot();

  await bot.launch();

  logger.info('Telegram bot started', {
    proxyEnabled: Boolean(env.telegramProxyUrl),
  });

  return bot;
}
