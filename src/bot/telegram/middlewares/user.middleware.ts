import type { Context, MiddlewareFn, Telegraf } from 'telegraf-hardened';

import { env } from '../../../config/env.js';
import { logger } from '../../../lib/logger.js';

const SUBSCRIBED_STATUSES = new Set([
  'creator',
  'administrator',
  'member',
]);

export const CHECK_SUBSCRIPTION_CALLBACK = 'subscription:check';

export async function isUserSubscribed(ctx: Context): Promise<boolean> {
  if (!ctx.from) {
    return false;
  }

  try {
    const member = await ctx.telegram.getChatMember(
      env.telegramChannelId,
      ctx.from.id,
    );

    return SUBSCRIBED_STATUSES.has(member.status);
  } catch (error) {
    logger.error('Failed to check Telegram channel subscription', error);
    return false;
  }
}

export async function replyWithSubscriptionPrompt(ctx: Context): Promise<void> {
  await ctx.reply(
    'Для использования бота необходимо подписаться на наш Telegram-канал.',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Подписаться на канал',
              url: env.telegramChannelUrl,
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
  const botInfo = await bot.telegram.getMe();
  const member = await bot.telegram.getChatMember(
    env.telegramChannelId,
    botInfo.id,
  );

  if (member.status !== 'administrator' && member.status !== 'creator') {
    throw new Error(
      `Telegram bot must be a channel administrator; current status: ${member.status}`,
    );
  }
}
