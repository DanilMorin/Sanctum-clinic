import type { Product } from '@prisma/client';

import type { CompletedQuizAnswers } from '../../domain/quiz/quiz.types.js';
import type { RecommendationResult } from '../../services/recommendation.service.js';

export interface ProductResponseDto {
  id: number;
  name: string;
  brand: string | null;
  category: string;
  spf: string | null;
  texture: string | null;
  isMakeupBase: boolean | null;
  description: string | null;
  doctorComment: string | null;
  imageUrl: string | null;
}

export interface QuizResultResponseDto {
  answers: CompletedQuizAnswers;
  recommendation: {
    ruleId: number;
    priorityFeature: string;
    mainProduct: ProductResponseDto | null;
    alternatives: ProductResponseDto[];
    professionalProduct: ProductResponseDto | null;
  };
}

export function toProductDto(product: Product): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    spf: product.spf,
    texture: product.texture,
    isMakeupBase: product.isMakeupBase,
    description: product.description,
    doctorComment: product.doctorComment,
    imageUrl: product.imageUrl,
  };
}

export function toQuizResultDto(params: {
  answers: CompletedQuizAnswers;
  recommendation: RecommendationResult;
}): QuizResultResponseDto {
  return {
    answers: params.answers,
    recommendation: {
      ruleId: params.recommendation.ruleId,
      priorityFeature: params.recommendation.priorityFeature,
      mainProduct: params.recommendation.mainProduct
        ? toProductDto(params.recommendation.mainProduct)
        : null,
      alternatives: params.recommendation.alternatives.map(toProductDto),
      professionalProduct: params.recommendation.professionalProduct
        ? toProductDto(params.recommendation.professionalProduct)
        : null,
    },
  };
}