import type { Context } from 'telegraf-hardened';

import { env } from '../../../config/env.js';

const START_QUIZ_CALLBACK = 'quiz:start';

export async function handleStartCommand(ctx: Context): Promise<void> {
  await ctx.reply(
    [
      'Персонализированный подбор SPF от врача-дерматолога',
      '',
      'Ответьте на 5 коротких вопросов — и получите персональную рекомендацию, подобранную с учётом особенностей вашей кожи.',
    ].join('\n'),
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Начать подбор в боте',
              callback_data: START_QUIZ_CALLBACK,
            },
          ],
          [
            {
              text: 'Открыть Mini App',
              web_app: {
                url: env.webAppUrl,
              },
            },
          ],
        ],
      },
    },
  );
}

export { START_QUIZ_CALLBACK };