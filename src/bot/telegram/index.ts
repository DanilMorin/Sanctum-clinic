import { Telegraf } from 'telegraf-hardened';

import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import {
  handleStartCommand,
  START_QUIZ_CALLBACK,
} from './commands/start.command.js';

export function createTelegramBot(): Telegraf {
  const bot = new Telegraf(env.botToken);

  bot.start(handleStartCommand);

  bot.action(START_QUIZ_CALLBACK, async (ctx) => {
    await ctx.answerCbQuery();

    await ctx.reply(
      [
        'Тест скоро начнётся.',
        '',
        'На следующем этапе мы добавим вопросы и пошаговую логику подбора SPF.',
      ].join('\n'),
    );
  });

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

  logger.info('Telegram bot started');

  return bot;
}