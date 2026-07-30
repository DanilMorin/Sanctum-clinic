import type {
  Lifestyle,
  SkinFeature,
  SkinType,
} from '../quiz/quiz.types.js';

export const RECOMMENDATION_NOT_AVAILABLE_MESSAGE = [
  'Для выбранного сочетания пока нет готовой рекомендации.',
  '',
  'Мы уже работаем над расширением базы. Пожалуйста, выберите другой вариант или обратитесь к специалисту.',
].join('\n');

export class RecommendationRuleNotFoundError extends Error {
  constructor(
    readonly input: {
      skinType: SkinType;
      priorityFeature: SkinFeature;
      lifestyle: Lifestyle;
    },
  ) {
    super(
      [
        'Recommendation rule was not found',
        `skinType=${input.skinType}`,
        `priorityFeature=${input.priorityFeature}`,
        `lifestyle=${input.lifestyle}`,
      ].join('; '),
    );
    this.name = 'RecommendationRuleNotFoundError';
  }
}
