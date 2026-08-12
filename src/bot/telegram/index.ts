import { Telegraf } from 'telegraf-hardened';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import {
  BOT_COMMANDS,
  handleHelpCommand,
} from './commands/help.command.js';
import { handleStartCommand } from './commands/start.command.js';
import { registerQuizHandlers } from './handlers/quiz.handler.js';
import {
  assertBotCanCheckSubscriptions,
  CHECK_SUBSCRIPTION_CALLBACK,
  requireChannelSubscription,
} from './middlewares/user.middleware.js';

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

  if (env.telegramSubscriptionRequired) {
    bot.use(requireChannelSubscription);

    bot.action(CHECK_SUBSCRIPTION_CALLBACK, async (ctx) => {
      await ctx.answerCbQuery('Подписка подтверждена');
      await handleStartCommand(ctx);
    });
  }

  bot.start(handleStartCommand);
  bot.help(handleHelpCommand);

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

  try {
    await bot.telegram.setMyCommands(BOT_COMMANDS);
  } catch (error) {
    logger.error('Failed to register Telegram bot commands', error);
  }

  await bot.launch();
  await assertBotCanCheckSubscriptions(bot);

  logger.info('Telegram bot started', {
    proxyEnabled: Boolean(env.telegramProxyUrl),
    subscriptionRequired: env.telegramSubscriptionRequired,
  });

  return bot;
}
