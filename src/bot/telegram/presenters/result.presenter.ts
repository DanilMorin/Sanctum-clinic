import type { Product } from '@prisma/client';

import {
  QUIZ_DISCLAIMER,
  QUIZ_FINAL_CARD_TEXT,
} from '../../../domain/quiz/quiz.constants.js';
import type { CompletedQuizAnswers } from '../../../domain/quiz/quiz.types.js';
import type {
  Lifestyle,
  ProductFormat,
  QuizQuestion,
  SkinFeature,
  SkinType,
  SpfUsage,
} from '../../../domain/quiz/quiz.types.js';
import type { RecommendationResult } from '../../../services/recommendation.service.js';

export const skinTypeLabels: Record<SkinType, string> = {
  oily: 'Жирная',
  combination: 'Комбинированная',
  dry: 'Сухая',
};

export const skinFeatureLabels: Record<SkinFeature, string> = {
  acne: 'Акне / высыпания',
  rosacea: 'Розацеа',
  couperose: 'Купероз',
  pigmentation: 'Пигментация',
  sensitive: 'Чувствительная / раздражённая',
  none: 'Без особенностей',
};

export const lifestyleLabels: Record<Lifestyle, string> = {
  active: 'Активный',
  normal: 'Обычный',
};

export const spfUsageLabels: Record<SpfUsage, string> = {
  makeup_base: 'Как база под макияж',
  standalone: 'Как самостоятельный уход',
};

export const productFormatLabels: Record<ProductFormat, string> = {
  pharmacy: 'Аптечная косметика',
  professional: 'Профессиональная косметика',
  both: 'Рассмотрю оба варианта',
};

export interface TemporaryQuizResult {
  skinType: SkinType;
  skinFeatures: SkinFeature[];
  lifestyle: Lifestyle;
  spfUsage: SpfUsage;
  productFormat: ProductFormat;
}

export function formatQuizQuestionText(question: QuizQuestion): string {
  const optionsDescription = question.options
    .filter((option) => option.description)
    .map((option) => `• ${option.label} — ${option.description}`)
    .join('\n');

  return [
    `Шаг ${question.step} из 5`,
    question.title,
    optionsDescription ? `\n${optionsDescription}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function formatSkinFeaturesQuestionText(
  question: QuizQuestion,
  selectedFeatures: SkinFeature[],
): string {
  const selectedText = selectedFeatures.length
    ? selectedFeatures.map((feature) => skinFeatureLabels[feature]).join(', ')
    : 'пока ничего не выбрано';

  return [
    `Шаг ${question.step} из 5`,
    question.title,
    '',
    `Выбрано: ${selectedText}`,
    '',
    'Можно выбрать несколько вариантов.',
    'Если выбрать «Без особенностей», остальные варианты будут сброшены.',
  ].join('\n');
}

export function formatTemporaryResultText(
  result: TemporaryQuizResult,
): string {
  return [
    'Тест пройден ✅',
    '',
    'Ваш профиль:',
    `Тип кожи: ${skinTypeLabels[result.skinType]}`,
    `Особенности: ${result.skinFeatures
      .map((feature) => skinFeatureLabels[feature])
      .join(', ')}`,
    `Образ жизни: ${lifestyleLabels[result.lifestyle]}`,
    `Использование SPF: ${spfUsageLabels[result.spfUsage]}`,
    `Формат средств: ${productFormatLabels[result.productFormat]}`,
    '',
    'На следующем этапе мы добавим базу SPF-средств и реальные рекомендации из MySQL.',
  ].join('\n');
}

function formatProductCard(title: string, product: Product | null): string[] {
  if (!product) {
    return [];
  }

  const rows = [
    title,
    product.name,
    product.brand ? `Бренд: ${product.brand}` : null,
    product.spf ? `SPF: ${product.spf}` : null,
    product.texture ? `Текстура: ${product.texture}` : null,
    typeof product.isMakeupBase === 'boolean'
      ? `Подходит как база под макияж: ${
          product.isMakeupBase ? 'да' : 'нет'
        }`
      : null,
    product.description ? `Описание: ${product.description}` : null,
    product.doctorComment ? `Комментарий врача: ${product.doctorComment}` : null,
  ].filter(Boolean);

  return rows as string[];
}

function formatAlternatives(alternatives: Product[]): string[] {
  if (!alternatives.length) {
    return [];
  }

  return [
    'Также подходит:',
    ...alternatives.map((product, index) => {
      const prefix = `${index + 1}. ${product.name}`;
      const details = [
        product.brand ? `бренд: ${product.brand}` : null,
        product.spf ? `SPF: ${product.spf}` : null,
        product.texture ? `текстура: ${product.texture}` : null,
      ]
        .filter(Boolean)
        .join(', ');

      return details ? `${prefix} (${details})` : prefix;
    }),
  ];
}

export function formatRecommendationResultText(input: {
  answers: CompletedQuizAnswers;
  recommendation: RecommendationResult;
}): string {
  const { answers, recommendation } = input;

  const profileRows = [
    'Тест пройден ✅',
    '',
    'Ваш профиль:',
    `Тип кожи: ${skinTypeLabels[answers.skinType]}`,
    `Особенности: ${answers.skinFeatures
      .map((feature) => skinFeatureLabels[feature])
      .join(', ')}`,
    `Приоритет подбора: ${skinFeatureLabels[answers.priorityFeature]}`,
    `Образ жизни: ${lifestyleLabels[answers.lifestyle]}`,
    `Использование SPF: ${spfUsageLabels[answers.spfUsage]}`,
    `Формат средств: ${productFormatLabels[answers.productFormat]}`,
  ];

  const mainProductRows = formatProductCard(
    'Основная рекомендация:',
    recommendation.mainProduct,
  );

  const alternativeRows = formatAlternatives(recommendation.alternatives);

  const professionalRows = formatProductCard(
    'Профессиональный вариант:',
    recommendation.professionalProduct,
  );

  return [
    ...profileRows,
    '',
    ...mainProductRows,
    mainProductRows.length ? '' : null,
    ...alternativeRows,
    alternativeRows.length ? '' : null,
    ...professionalRows,
    professionalRows.length ? '' : null,
    'Важно:',
    QUIZ_DISCLAIMER,
    '',
    QUIZ_FINAL_CARD_TEXT,
  ]
    .filter(Boolean)
    .join('\n');
}