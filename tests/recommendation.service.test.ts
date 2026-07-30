import assert from 'node:assert/strict';
import test from 'node:test';

import { RecommendationRuleNotFoundError } from '../src/domain/recommendation/recommendation.errors.js';
import { recommendationRuleRepository } from '../src/repositories/recommendation-rule.repository.js';
import { RecommendationService } from '../src/services/recommendation.service.js';

test('throws a typed error when an exact or fallback rule is absent', async () => {
  const service = new RecommendationService();
  const originalFindMatchingRule =
    recommendationRuleRepository.findMatchingRule;

  recommendationRuleRepository.findMatchingRule = async () => null;

  try {
    await assert.rejects(
      () =>
        service.findMatchingRecommendation({
          skinType: 'dry',
          skinFeatures: ['acne'],
          lifestyle: 'normal',
        }),
      (error: unknown) => {
        assert.ok(error instanceof RecommendationRuleNotFoundError);
        assert.deepEqual(error.input, {
          skinType: 'dry',
          priorityFeature: 'acne',
          lifestyle: 'normal',
        });

        return true;
      },
    );
  } finally {
    recommendationRuleRepository.findMatchingRule =
      originalFindMatchingRule;
  }
});
