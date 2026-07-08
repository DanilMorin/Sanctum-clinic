import type { QuizSession } from '@prisma/client';
import type { Telegraf } from 'telegraf-hardened';

import {
    getQuizQuestionByStep,
    normalizeSkinFeaturesSelection,
} from '../../../domain/quiz/quiz.rules.js';
import type {
    Lifestyle,
    ProductFormat,
    SkinFeature,
    SkinType,
    SpfUsage,
} from '../../../domain/quiz/quiz.types.js';
import { logger } from '../../../lib/logger.js';
import { quizService } from '../../../services/quiz.service.js';
import { userService } from '../../../services/user.service.js';
import { parseQuizCallback } from './callback.handler.js';
import {
    buildRestartKeyboard,
    buildSingleChoiceKeyboard,
    buildSkinFeaturesKeyboard,
} from '../keyboards/quiz.keyboard.js';
import {
    formatQuizQuestionText,
    formatRecommendationResultText,
    formatSkinFeaturesQuestionText,
    formatTemporaryResultText,
} from '../presenters/result.presenter.js';

function getCallbackData(ctx: any): string | null {
    const data = ctx.callbackQuery?.data;

    if (typeof data !== 'string') {
        return null;
    }

    return data;
}

function parseSkinFeatures(value: unknown): SkinFeature[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter((item): item is SkinFeature => {
        return (
            item === 'acne' ||
            item === 'rosacea' ||
            item === 'couperose' ||
            item === 'pigmentation' ||
            item === 'sensitive' ||
            item === 'none'
        );
    });
}

//функция не нужна, так как мы не используем временный результат в боте, а сразу сохраняем ответы в сессию
//после тестирования можно будет удалить
// function buildTemporaryResultFromSession(
//     session: QuizSession,
// ): ReturnType<typeof formatTemporaryResultText> {
//     if (
//         !session.skinType ||
//         !session.lifestyle ||
//         session.lifestyle === 'any' ||
//         !session.spfUsage ||
//         !session.productFormat
//     ) {
//         throw new Error('Quiz session is incomplete');
//     }

//     return formatTemporaryResultText({
//         skinType: session.skinType as SkinType,
//         skinFeatures: parseSkinFeatures(session.skinFeatures),
//         lifestyle: session.lifestyle as Lifestyle,
//         spfUsage: session.spfUsage as SpfUsage,
//         productFormat: session.productFormat as ProductFormat,
//     });
// }

async function sendQuestion(
    ctx: any,
    sessionId: number,
    step: number,
): Promise<void> {
    const question = getQuizQuestionByStep(step);

    if (question.id === 'skin_features') {
        const session = await quizService.getSessionById(sessionId);
        const selectedFeatures = parseSkinFeatures(session.skinFeatures);

        await ctx.reply(formatSkinFeaturesQuestionText(question, selectedFeatures), {
            reply_markup: buildSkinFeaturesKeyboard(
                sessionId,
                question,
                selectedFeatures,
            ),
        });

        return;
    }

    await ctx.reply(formatQuizQuestionText(question), {
        reply_markup: buildSingleChoiceKeyboard(sessionId, question),
    });
}

async function handleStartQuiz(ctx: any): Promise<void> {
    if (!ctx.from) {
        await ctx.reply('Не удалось определить пользователя Telegram.');
        return;
    }

    const user = await userService.getOrCreateTelegramUser({
        telegramId: ctx.from.id,
        username: ctx.from.username,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name,
    });

    const session = await quizService.startQuiz(user.id);

    await ctx.reply('Начинаем подбор SPF-средства.');
    await sendQuestion(ctx, session.id, 1);
}

async function handleSingleAnswer(
    ctx: any,
    sessionId: number,
    step: number,
    value: string,
): Promise<void> {
    if (step === 1) {
        await quizService.saveSkinType(sessionId, value as SkinType);
        await sendQuestion(ctx, sessionId, 2);
        return;
    }

    if (step === 3) {
        await quizService.saveLifestyle(sessionId, value as Lifestyle);
        await sendQuestion(ctx, sessionId, 4);
        return;
    }

    if (step === 4) {
        await quizService.saveSpfUsage(sessionId, value as SpfUsage);
        await sendQuestion(ctx, sessionId, 5);
        return;
    }

    if (step === 5) {
        await quizService.saveProductFormat(sessionId, value as ProductFormat);

        const result = await quizService.completeQuizSession(sessionId);

        await ctx.reply(
            formatRecommendationResultText({
                answers: result.answers,
                recommendation: result.recommendation,
            }),
            {
                reply_markup: buildRestartKeyboard(),
            },
        );

        return;
    }

    await ctx.reply('Неизвестный шаг теста. Попробуйте начать заново.');
}

async function handleSkinFeatureToggle(
    ctx: any,
    sessionId: number,
    value: string,
): Promise<void> {
    const session = await quizService.getSessionById(sessionId);
    const currentFeatures = parseSkinFeatures(session.skinFeatures);

    const nextFeatures = normalizeSkinFeaturesSelection(
        currentFeatures,
        value as SkinFeature,
    );

    await quizService.saveSkinFeatures(sessionId, nextFeatures);

    const question = getQuizQuestionByStep(2);

    await ctx.editMessageText(
        formatSkinFeaturesQuestionText(question, nextFeatures),
        {
            reply_markup: buildSkinFeaturesKeyboard(
                sessionId,
                question,
                nextFeatures,
            ),
        },
    );
}

async function handleNextStep(
    ctx: any,
    sessionId: number,
    step: number,
): Promise<void> {
    if (step === 2) {
        const session = await quizService.getSessionById(sessionId);
        const selectedFeatures = parseSkinFeatures(session.skinFeatures);

        if (!selectedFeatures.length) {
            await ctx.reply('Выберите хотя бы один вариант, чтобы продолжить.');
            return;
        }

        await sendQuestion(ctx, sessionId, 3);
        return;
    }

    await ctx.reply('Неизвестный переход. Попробуйте начать заново.');
}

export function registerQuizHandlers(bot: Telegraf): void {
    bot.action(/^quiz:/, async (ctx) => {
        const data = getCallbackData(ctx);

        if (!data) {
            await ctx.reply('Не удалось обработать действие.');
            return;
        }

        const callback = parseQuizCallback(data);

        try {
            await ctx.answerCbQuery();

            if (callback.type === 'start' || callback.type === 'restart') {
                await handleStartQuiz(ctx);
                return;
            }

            if (callback.type === 'answer') {
                await handleSingleAnswer(
                    ctx,
                    callback.sessionId,
                    callback.step,
                    callback.value,
                );
                return;
            }

            if (callback.type === 'feature') {
                await handleSkinFeatureToggle(ctx, callback.sessionId, callback.value);
                return;
            }

            if (callback.type === 'next') {
                await handleNextStep(ctx, callback.sessionId, callback.step);
                return;
            }

            await ctx.reply('Неизвестное действие. Попробуйте начать заново.');
        } catch (error) {
            logger.error('Quiz handler error', error);

            await ctx.reply(
                'Произошла ошибка при прохождении теста. Попробуйте начать заново командой /start.',
            );
        }
    });
}