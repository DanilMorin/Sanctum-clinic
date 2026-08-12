import assert from 'node:assert/strict';
import test from 'node:test';

import type { Telegraf } from 'telegraf-hardened';

import { launchTelegramBotWithRetry } from '../src/bot/telegram/index.js';

test('Telegram bot launch retries transient network failures', async () => {
  let launchAttempts = 0;
  const delays: number[] = [];
  const bot = {
    launch: async () => {
      launchAttempts += 1;

      if (launchAttempts < 3) {
        throw new TypeError('fetch failed');
      }
    },
  } as unknown as Telegraf;

  await launchTelegramBotWithRetry(bot, async (delayMs) => {
    delays.push(delayMs);
  });

  assert.equal(launchAttempts, 3);
  assert.deepEqual(delays, [5_000, 15_000]);
});

test('Telegram bot launch does not retry API or configuration errors', async () => {
  let launchAttempts = 0;
  const bot = {
    launch: async () => {
      launchAttempts += 1;
      throw new Error('401: Unauthorized');
    },
  } as unknown as Telegraf;

  await assert.rejects(
    launchTelegramBotWithRetry(bot, async () => {}),
    /401: Unauthorized/,
  );
  assert.equal(launchAttempts, 1);
});
