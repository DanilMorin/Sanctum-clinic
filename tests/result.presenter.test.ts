import assert from 'node:assert/strict';
import test from 'node:test';

import type { Product } from '@prisma/client';

import {
  CONSULTATION_LINK,
  CONSULTATION_MESSAGE,
  CONSULTATION_MESSAGE_HTML,
  formatRecommendationResultText,
} from '../src/bot/telegram/presenters/result.presenter.js';

function createProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'Тестовый SPF',
    brand: 'Test Brand',
    category: 'pharmacy',
    spf: 'SPF50',
    texture: 'Флюид',
    isMakeupBase: true,
    description: 'Лёгкое средство для ежедневного применения.',
    doctorComment: null,
    imageUrl: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

test('formats the Telegram result as readable sections with complete product details', () => {
  const result = formatRecommendationResultText({
    answers: {
      skinType: 'oily',
      skinFeatures: ['pigmentation'],
      priorityFeature: 'pigmentation',
      lifestyle: 'active',
      spfUsage: 'makeup_base',
      productFormat: 'both',
    },
    recommendation: {
      ruleId: 1,
      priorityFeature: 'pigmentation',
      mainProduct: createProduct(),
      alternatives: [
        createProduct({
          id: 2,
          name: 'Альтернативный SPF',
          isMakeupBase: false,
          description: 'Альтернативное средство.',
        }),
      ],
      professionalProduct: createProduct({
        id: 3,
        name: 'Профессиональный SPF',
        category: 'professional',
        doctorComment: 'Комментарий специалиста.',
      }),
    },
  });

  assert.match(result, /✅ ТЕСТ ПРОЙДЕН\n\n👤 ВАШ ПРОФИЛЬ\n\n/);
  assert.match(result, /🧴 ОСНОВНАЯ РЕКОМЕНДАЦИЯ\n\nТестовый SPF/);
  assert.match(result, /• Текстура: Флюид/);
  assert.match(result, /• Подходит как база под макияж: да/);
  assert.match(result, /🔄 ТАКЖЕ ПОДХОДЯТ\n\n1\. Альтернативный SPF/);
  assert.match(result, /   • Подходит как база под макияж: нет/);
  assert.match(result, /   • Описание: Альтернативное средство\./);
  assert.match(result, /💎 ПРОФЕССИОНАЛЬНЫЙ ВАРИАНТ/);
  assert.match(result, /• Комментарий врача: Комментарий специалиста\./);
  assert.match(result, /⚠️ ВАЖНО\n\n/);
  assert.doesNotMatch(result, /Записаться на консультацию/);
  assert.doesNotMatch(result, /https:\/\//);
  assert.equal(CONSULTATION_MESSAGE, '➡️ Записаться на консультацию → @sanctumclinic');
  assert.equal(
    CONSULTATION_MESSAGE_HTML,
    `➡️ <a href="${CONSULTATION_LINK}">Записаться на консультацию</a> → @sanctumclinic`,
  );
  assert.doesNotMatch(CONSULTATION_LINK, /\s/);
  assert.ok(result.length < 4096);
});

test('omits only missing product properties and preserves section spacing', () => {
  const result = formatRecommendationResultText({
    answers: {
      skinType: 'dry',
      skinFeatures: ['none'],
      priorityFeature: 'none',
      lifestyle: 'normal',
      spfUsage: 'standalone',
      productFormat: 'pharmacy',
    },
    recommendation: {
      ruleId: 2,
      priorityFeature: 'none',
      mainProduct: createProduct({
        brand: null,
        texture: null,
        isMakeupBase: null,
        description: null,
      }),
      alternatives: [],
      professionalProduct: null,
    },
  });

  assert.doesNotMatch(result, /Бренд:/);
  assert.doesNotMatch(result, /Текстура:/);
  assert.doesNotMatch(result, /Подходит как база/);
  assert.match(result, /🧴 ОСНОВНАЯ РЕКОМЕНДАЦИЯ\n\nТестовый SPF\n• SPF: SPF50/);
  assert.match(result, /──────────\n\n⚠️ ВАЖНО/);
});
