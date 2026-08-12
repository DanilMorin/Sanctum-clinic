import type { Context, MiddlewareFn, Telegraf } from 'telegraf-hardened';

import { env } from '../../../config/env.js';
import { logger } from '../../../lib/logger.js';

const SUBSCRIBED_STATUSES = new Set([
  'creator',
  'administrator',
  'member',
]);

export const CHECK_SUBSCRIPTION_CALLBACK = 'subscription:check';

export function isTransientTelegramNetworkError(error: unknown): error is Error {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === 'AbortError' ||
    error.name === 'TimeoutError' ||
    (error instanceof TypeError && error.message === 'fetch failed')
  );
}

function getChannelConfig(): { id: string; url: string } {
  const { telegramChannelId: id, telegramChannelUrl: url } = env;

  if (!id || !url) {
    throw new Error('Telegram channel configuration is missing');
  }

  return { id, url };
}

export async function isUserSubscribed(ctx: Context): Promise<boolean> {
  if (!ctx.from) {
    return false;
  }

  try {
    const { id } = getChannelConfig();
    const member = await ctx.telegram.getChatMember(
      id,
      ctx.from.id,
    );

    return SUBSCRIBED_STATUSES.has(member.status);
  } catch (error) {
    logger.error('Failed to check Telegram channel subscription', error);
    return false;
  }
}

export async function replyWithSubscriptionPrompt(ctx: Context): Promise<void> {
  const { url } = getChannelConfig();

  await ctx.reply(
    'Для использования бота необходимо подписаться на наш Telegram-канал.',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Подписаться на канал',
              url,
            },
          ],
          [
            {
              text: 'Я подписался — проверить',
              callback_data: CHECK_SUBSCRIPTION_CALLBACK,
            },
          ],
        ],
      },
    },
  );
}

export const requireChannelSubscription: MiddlewareFn<Context> = async (
  ctx,
  next,
): Promise<void> => {
  if (ctx.chat?.type !== 'private') {
    await next();
    return;
  }

  if (await isUserSubscribed(ctx)) {
    await next();
    return;
  }

  if (ctx.callbackQuery) {
    const isSubscriptionCheck =
      'data' in ctx.callbackQuery &&
      ctx.callbackQuery.data === CHECK_SUBSCRIPTION_CALLBACK;

    await ctx.answerCbQuery(
      isSubscriptionCheck
        ? 'Подписка пока не найдена. Подпишитесь и попробуйте снова.'
        : 'Для продолжения необходимо подписаться на канал.',
      { show_alert: true },
    );

    if (isSubscriptionCheck) {
      return;
    }
  }

  await replyWithSubscriptionPrompt(ctx);
};

export async function assertBotCanCheckSubscriptions(
  bot: Telegraf,
): Promise<void> {
  if (!env.telegramSubscriptionRequired) {
    return;
  }

  const { id } = getChannelConfig();
  let member;

  try {
    const botInfo = bot.botInfo ?? (await bot.telegram.getMe());
    member = await bot.telegram.getChatMember(id, botInfo.id);
  } catch (error) {
    if (!isTransientTelegramNetworkError(error)) {
      throw error;
    }

    logger.warn(
      'Telegram subscription permissions could not be checked because the network is unavailable; bot startup will continue',
      {
        errorName: error.name,
        errorMessage: error.message,
      },
    );

    return;
  }

  if (member.status !== 'administrator' && member.status !== 'creator') {
    throw new Error(
      `Telegram bot must be a channel administrator; current status: ${member.status}`,
    );
  }
}
