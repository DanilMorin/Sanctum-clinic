/*
 Сервис сам определяет priorityFeature;
 Сервис ищет правило в базе;
 Сервис фильтрует результат по productFormat;
Telegram про эту логику ничего знать не будет;
*/
import type { Prisma, Product } from '@prisma/client';
import { getPrioritySkinFeature } from '../domain/quiz/quiz.rules.js';
import type {
  CompletedQuizAnswers,
  ProductFormat,
  SkinFeature,
  SkinType,
  Lifestyle,
} from '../domain/quiz/quiz.types.js';
import { recommendationRuleRepository } from '../repositories/recommendation-rule.repository.js';

type RecommendationRuleWithProducts =
  Prisma.RecommendationRuleGetPayload<{
    include: {
      mainProduct: true;
      professionalProduct: true;
      alternatives: {
        include: {
          product: true;
        };
      };
    };
  }>;

export interface RecommendationLookupInput {
  skinType: SkinType;
  skinFeatures: SkinFeature[];
  lifestyle: Lifestyle;
}

export interface RecommendationResult {
  ruleId: number;
  priorityFeature: SkinFeature;
  mainProduct: Product | null;
  alternatives: Product[];
  professionalProduct: Product | null;
}

export class RecommendationService {
  getPriorityFeature(features: SkinFeature[]): SkinFeature {
    return getPrioritySkinFeature(features);
  }

  async findMatchingRecommendation(
    input: RecommendationLookupInput,
  ): Promise<RecommendationRuleWithProducts> {
    const priorityFeature = this.getPriorityFeature(input.skinFeatures);

    const rule = await recommendationRuleRepository.findMatchingRule({
      skinType: input.skinType,
      priorityFeature,
      lifestyle: input.lifestyle,
    });

    if (!rule) {
      throw new Error(
        [
          'Recommendation rule was not found',
          `skinType=${input.skinType}`,
          `priorityFeature=${priorityFeature}`,
          `lifestyle=${input.lifestyle}`,
        ].join('; '),
      );
    }

    return rule;
  }

  prepareResult(
    rule: RecommendationRuleWithProducts,
    productFormat: ProductFormat,
  ): RecommendationResult {
    const alternatives = rule.alternatives.map((item) => item.product);

    if (productFormat === 'pharmacy') {
      return {
        ruleId: rule.id,
        priorityFeature: rule.priorityFeature,
        mainProduct: rule.mainProduct,
        alternatives,
        professionalProduct: null,
      };
    }

    if (productFormat === 'professional') {
      return {
        ruleId: rule.id,
        priorityFeature: rule.priorityFeature,
        mainProduct: null,
        alternatives: [],
        professionalProduct: rule.professionalProduct,
      };
    }

    return {
      ruleId: rule.id,
      priorityFeature: rule.priorityFeature,
      mainProduct: rule.mainProduct,
      alternatives,
      professionalProduct: rule.professionalProduct,
    };
  }

  async calculateResult(
    answers: CompletedQuizAnswers,
  ): Promise<RecommendationResult> {
    const rule = await this.findMatchingRecommendation({
      skinType: answers.skinType,
      skinFeatures: answers.skinFeatures,
      lifestyle: answers.lifestyle,
    });

    return this.prepareResult(rule, answers.productFormat);
  }
}

export const recommendationService = new RecommendationService();