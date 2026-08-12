import assert from 'node:assert/strict';
import test from 'node:test';

import type { Telegraf } from 'telegraf-hardened';

import { env } from '../src/config/env.js';
import { assertBotCanCheckSubscriptions } from '../src/bot/telegram/middlewares/user.middleware.js';

function createBotMock(input: {
  getMe?: () => Promise<{ id: number }>;
  getChatMember?: () => Promise<{ status: string }>;
}): Telegraf {
  return {
    telegram: {
      getMe: input.getMe ?? (async () => ({ id: 1 })),
      getChatMember:
        input.getChatMember ?? (async () => ({ status: 'administrator' })),
    },
  } as unknown as Telegraf;
}

test('subscription startup check tolerates a transient Telegram network failure', async () => {
  const previousRequired = env.telegramSubscriptionRequired;
  const previousChannelId = env.telegramChannelId;
  const previousChannelUrl = env.telegramChannelUrl;

  Object.assign(env, {
    telegramSubscriptionRequired: true,
    telegramChannelId: '-1001234567890',
    telegramChannelUrl: 'https://t.me/sanctumclinic',
  });

  try {
    await assert.doesNotReject(
      assertBotCanCheckSubscriptions(
        createBotMock({
          getMe: async () => {
            throw new TypeError('fetch failed');
          },
        }),
      ),
    );
  } finally {
    Object.assign(env, {
      telegramSubscriptionRequired: previousRequired,
      telegramChannelId: previousChannelId,
      telegramChannelUrl: previousChannelUrl,
    });
  }
});

test('subscription startup check still rejects a bot without administrator rights', async () => {
  const previousRequired = env.telegramSubscriptionRequired;
  const previousChannelId = env.telegramChannelId;
  const previousChannelUrl = env.telegramChannelUrl;

  Object.assign(env, {
    telegramSubscriptionRequired: true,
    telegramChannelId: '-1001234567890',
    telegramChannelUrl: 'https://t.me/sanctumclinic',
  });

  try {
    await assert.rejects(
      assertBotCanCheckSubscriptions(
        createBotMock({
          getChatMember: async () => ({ status: 'member' }),
        }),
      ),
      /must be a channel administrator; current status: member/,
    );
  } finally {
    Object.assign(env, {
      telegramSubscriptionRequired: previousRequired,
      telegramChannelId: previousChannelId,
      telegramChannelUrl: previousChannelUrl,
    });
  }
});

test('subscription startup check does not hide non-network Telegram errors', async () => {
  const previousRequired = env.telegramSubscriptionRequired;
  const previousChannelId = env.telegramChannelId;
  const previousChannelUrl = env.telegramChannelUrl;

  Object.assign(env, {
    telegramSubscriptionRequired: true,
    telegramChannelId: '-1001234567890',
    telegramChannelUrl: 'https://t.me/sanctumclinic',
  });

  try {
    await assert.rejects(
      assertBotCanCheckSubscriptions(
        createBotMock({
          getMe: async () => {
            throw new Error('401: Unauthorized');
          },
        }),
      ),
      /401: Unauthorized/,
    );
  } finally {
    Object.assign(env, {
      telegramSubscriptionRequired: previousRequired,
      telegramChannelId: previousChannelId,
      telegramChannelUrl: previousChannelUrl,
    });
  }
});
