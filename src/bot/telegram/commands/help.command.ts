import type { Context } from 'telegraf-hardened';

import { env } from '../../../config/env.js';

export const BOT_COMMANDS = [
  {
    command: 'start',
    description: 'Начать подбор SPF-средства',
  },
  {
    command: 'help',
    description: 'Помощь и список возможностей',
  },
];

export async function handleHelpCommand(ctx: Context): Promise<void> {
  await ctx.reply(
    [
      'Помощь по боту Sanctum Clinic',
      '',
      'Бот помогает подобрать SPF-средство по типу и особенностям кожи, образу жизни и предпочтительному формату косметики.',
      '',
      'Доступные команды:',
      '/start — начать новый подбор или открыть Mini App',
      '/help — показать эту справку',
      '',
      'Как пройти подбор:',
      '1. Нажмите /start.',
      '2. Ответьте на 5 вопросов.',
      '3. Получите основную рекомендацию, альтернативы и профессиональный вариант.',
      '',
      'Рекомендации носят информационный характер и не заменяют консультацию врача.',
    ].join('\n'),
    {
      reply_markup: {
        inline_keyboard: [
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
