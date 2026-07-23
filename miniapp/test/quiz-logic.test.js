import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialQuizState,
  getProductTags,
  getResultProfileTags,
  isQuestionAnswered,
  normalizeFeatureSelection,
} from '../src/features/quiz/quiz-logic.js';

test('createInitialQuizState returns independent answer collections', () => {
  const firstState = createInitialQuizState();
  const secondState = createInitialQuizState();

  firstState.answers.skinFeatures.push('acne');

  assert.deepEqual(secondState.answers.skinFeatures, []);
});

test('normalizeFeatureSelection makes none mutually exclusive', () => {
  assert.deepEqual(normalizeFeatureSelection(['acne'], 'none'), ['none']);
  assert.deepEqual(normalizeFeatureSelection(['none'], 'acne'), ['acne']);
  assert.deepEqual(normalizeFeatureSelection(['none'], 'none'), []);
});

test('normalizeFeatureSelection toggles regular features', () => {
  assert.deepEqual(normalizeFeatureSelection(['acne'], 'sensitive'), [
    'acne',
    'sensitive',
  ]);
  assert.deepEqual(normalizeFeatureSelection(['acne', 'sensitive'], 'acne'), [
    'sensitive',
  ]);
});

test('isQuestionAnswered supports single and multiple answers', () => {
  const state = createInitialQuizState();
  const singleQuestion = { id: 'skin_type', type: 'single' };
  const multipleQuestion = { id: 'skin_features', type: 'multiple' };

  assert.equal(isQuestionAnswered(singleQuestion, state.answers), false);
  assert.equal(isQuestionAnswered(multipleQuestion, state.answers), false);

  state.answers.skinType = 'dry';
  state.answers.skinFeatures = ['sensitive'];

  assert.equal(isQuestionAnswered(singleQuestion, state.answers), true);
  assert.equal(isQuestionAnswered(multipleQuestion, state.answers), true);
});

test('getResultProfileTags returns labels in quiz order', () => {
  const tags = getResultProfileTags({
    skinType: 'dry',
    skinFeatures: ['sensitive'],
    lifestyle: 'normal',
    spfUsage: 'standalone',
    productFormat: 'both',
  });

  assert.deepEqual(tags, [
    'Сухая кожа',
    'Чувствительная кожа',
    'Обычный ритм',
    'Самостоятельный уход',
    'Рассмотрю аптечные и профессиональные варианты',
  ]);
});

test('getProductTags formats optional product properties', () => {
  assert.deepEqual(
    getProductTags({
      spf: 'SPF50',
      texture: 'Лёгкая',
      isMakeupBase: true,
    }),
    ['SPF 50', 'Лёгкая текстура', 'Под макияж: да'],
  );
  assert.deepEqual(getProductTags(null), []);
});
