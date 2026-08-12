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

export const CONSULTATION_LINK =
  'https://t.me/sanctumclinic?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5,%E2%A0%80%D0%BF%D0%B8%D1%88%D1%83%E2%A0%80%D0%B8%D0%B7%E2%A0%80%D0%A2%D0%93%E2%A0%80%D0%BA%D0%B0%D0%BD%D0%B0%D0%BB%D0%B0';

export const CONSULTATION_MESSAGE =
  '➡️ Записаться на консультацию → @sanctumclinic';

export const CONSULTATION_MESSAGE_HTML =
  `➡️ <a href="${CONSULTATION_LINK}">Записаться на консультацию</a> → @sanctumclinic`;

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

function formatProductDetails(
  product: Product,
  indentation = '',
): string[] {
  return [
    product.brand ? `${indentation}• Бренд: ${product.brand}` : null,
    product.spf ? `${indentation}• SPF: ${product.spf}` : null,
    product.texture ? `${indentation}• Текстура: ${product.texture}` : null,
    typeof product.isMakeupBase === 'boolean'
      ? `${indentation}• Подходит как база под макияж: ${
          product.isMakeupBase ? 'да' : 'нет'
        }`
      : null,
    product.description
      ? `${indentation}• Описание: ${product.description}`
      : null,
    product.doctorComment
      ? `${indentation}• Комментарий врача: ${product.doctorComment}`
      : null,
  ].filter((row): row is string => row !== null);
}

function formatProductCard(title: string, product: Product | null): string[] {
  if (!product) {
    return [];
  }

  return [
    title,
    '',
    product.name,
    ...formatProductDetails(product),
  ];
}

function formatAlternatives(alternatives: Product[]): string[] {
  if (!alternatives.length) {
    return [];
  }

  return [
    '🔄 ТАКЖЕ ПОДХОДЯТ',
    '',
    ...alternatives.flatMap((product, index) => [
      `${index + 1}. ${product.name}`,
      ...formatProductDetails(product, '   '),
      index < alternatives.length - 1 ? '' : null,
    ]),
  ].filter((row): row is string => row !== null);
}

function formatProfileRows(answers: CompletedQuizAnswers): string[] {
  return [
    '✅ ТЕСТ ПРОЙДЕН',
    '',
    '👤 ВАШ ПРОФИЛЬ',
    '',
    `• Тип кожи: ${skinTypeLabels[answers.skinType]}`,
    `• Особенности: ${answers.skinFeatures
      .map((feature) => skinFeatureLabels[feature])
      .join(', ')}`,
    `• Приоритет подбора: ${skinFeatureLabels[answers.priorityFeature]}`,
    `• Образ жизни: ${lifestyleLabels[answers.lifestyle]}`,
    `• Использование SPF: ${spfUsageLabels[answers.spfUsage]}`,
    `• Формат средств: ${productFormatLabels[answers.productFormat]}`,
  ];
}

export function formatRecommendationResultText(input: {
  answers: CompletedQuizAnswers;
  recommendation: RecommendationResult;
}): string {
  const { answers, recommendation } = input;

  const profileRows = formatProfileRows(answers);

  const mainProductRows = formatProductCard(
    '🧴 ОСНОВНАЯ РЕКОМЕНДАЦИЯ',
    recommendation.mainProduct,
  );

  const alternativeRows = formatAlternatives(recommendation.alternatives);

  const professionalRows = formatProductCard(
    '💎 ПРОФЕССИОНАЛЬНЫЙ ВАРИАНТ',
    recommendation.professionalProduct,
  );

  return [
    ...profileRows,
    '',
    ...mainProductRows,
    mainProductRows.length ? ['', '──────────'] : null,
    mainProductRows.length ? '' : null,
    ...alternativeRows,
    alternativeRows.length ? ['', '──────────'] : null,
    alternativeRows.length ? '' : null,
    ...professionalRows,
    professionalRows.length ? ['', '──────────'] : null,
    professionalRows.length ? '' : null,
    '⚠️ ВАЖНО',
    '',
    QUIZ_DISCLAIMER,
    '',
    QUIZ_FINAL_CARD_TEXT,
  ]
    .flat()
    .filter((row): row is string => row !== null)
    .join('\n');
}
