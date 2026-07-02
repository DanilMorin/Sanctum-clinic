import type { Context } from 'telegraf-hardened';

const START_QUIZ_CALLBACK = 'quiz:start';

export async function handleStartCommand(ctx: Context): Promise<void> {
  await ctx.reply(
    [
      `Персонализированный подбор SPF от врача-дерматолога,  
      
      'Ответьте на 5 коротких вопросов — и получите персональную рекомендацию, подобранную с учётом особенностей вашей кожи.`,
    ].join('\n'),
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Начать подбор',
              callback_data: START_QUIZ_CALLBACK,
            },
          ],
        ],
      },
    },
  );
}

export { START_QUIZ_CALLBACK };