import type {
  Lifestyle,
  RecommendationRule,
  SkinFeature,
  SkinType,
} from '@prisma/client';

import { prisma } from '../lib/prisma.js';

export interface FindRecommendationRuleInput {
  skinType: SkinType;
  priorityFeature: SkinFeature;
  lifestyle: Exclude<Lifestyle, 'any'>;
}

export class RecommendationRuleRepository {
  async findById(id: number): Promise<RecommendationRule | null> {
    return prisma.recommendationRule.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdWithProducts(id: number) {
    return prisma.recommendationRule.findUnique({
      where: {
        id,
      },
      include: {
        mainProduct: true,
        professionalProduct: true,
        alternatives: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findMatchingRule(input: FindRecommendationRuleInput) {
    const exactRule = await prisma.recommendationRule.findUnique({
      where: {
        skinType_priorityFeature_lifestyle: {
          skinType: input.skinType,
          priorityFeature: input.priorityFeature,
          lifestyle: input.lifestyle,
        },
      },
      include: {
        mainProduct: true,
        professionalProduct: true,
        alternatives: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            product: true,
          },
        },
      },
    });

    if (exactRule) {
      return exactRule;
    }

    return prisma.recommendationRule.findUnique({
      where: {
        skinType_priorityFeature_lifestyle: {
          skinType: input.skinType,
          priorityFeature: input.priorityFeature,
          lifestyle: 'any',
        },
      },
      include: {
        mainProduct: true,
        professionalProduct: true,
        alternatives: {
          orderBy: {
            sortOrder: 'asc',
          },
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findMany(): Promise<RecommendationRule[]> {
    return prisma.recommendationRule.findMany({
      orderBy: [
        {
          skinType: 'asc',
        },
        {
          priorityFeature: 'asc',
        },
        {
          lifestyle: 'asc',
        },
      ],
    });
  }
}

export const recommendationRuleRepository =
  new RecommendationRuleRepository();