/*
startQuiz() — создаёт новую сессию теста;
перед созданием новой сессии закрывает старые started-сессии;
saveSkinType() — сохраняет тип кожи;
saveSkinFeatures() — сохраняет особенности и priorityFeature;
saveLifestyle() — сохраняет образ жизни;
saveSpfUsage() — сохраняет сценарий использования SPF;
saveProductFormat() — сохраняет формат продукта;
completeQuizSession() — завершает тест и рассчитывает рекомендацию.
*/ 
import type { QuizSession } from '@prisma/client';

import {
  completeQuizAnswers,
  getPrioritySkinFeature,
} from '../domain/quiz/quiz.rules.js';
import type {
  CompletedQuizAnswers,
  Lifestyle,
  ProductFormat,
  QuizAnswers,
  SkinFeature,
  SkinType,
  SpfUsage,
} from '../domain/quiz/quiz.types.js';
import { quizSessionRepository } from '../repositories/quiz-session.repository.js';
import {
  recommendationService,
  type RecommendationResult,
} from './recommendation.service.js';

export interface SaveQuizAnswersInput {
  skinType?: SkinType;
  skinFeatures?: SkinFeature[];
  lifestyle?: Lifestyle;
  spfUsage?: SpfUsage;
  productFormat?: ProductFormat;
}

export interface CompleteQuizSessionResult {
  session: QuizSession;
  answers: CompletedQuizAnswers;
  recommendation: RecommendationResult;
}

export interface QuizResult {
  session: QuizSession;
  answers: CompletedQuizAnswers;
  recommendation: RecommendationResult;
}

export class QuizService {
  async startQuiz(userId: number): Promise<QuizSession> {
    await quizSessionRepository.abandonStartedSessionsByUserId(userId);

    return quizSessionRepository.create({
      userId,
    });
  }

  async getSessionById(sessionId: number): Promise<QuizSession> {
    const session = await quizSessionRepository.findById(sessionId);

    if (!session) {
      throw new Error(`Quiz session with id ${sessionId} was not found`);
    }

    return session;
  }

  async getLatestStartedSession(userId: number): Promise<QuizSession | null> {
    return quizSessionRepository.findLatestStartedByUserId(userId);
  }

  async saveAnswers(
    sessionId: number,
    input: SaveQuizAnswersInput,
  ): Promise<QuizSession> {
    return quizSessionRepository.updateAnswers(sessionId, {
      skinType: input.skinType,
      skinFeatures: input.skinFeatures,
      priorityFeature: input.skinFeatures
        ? getPrioritySkinFeature(input.skinFeatures)
        : undefined,
      lifestyle: input.lifestyle,
      spfUsage: input.spfUsage,
      productFormat: input.productFormat,
    });
  }

  async saveSkinType(
    sessionId: number,
    skinType: SkinType,
  ): Promise<QuizSession> {
    return this.saveAnswers(sessionId, {
      skinType,
    });
  }

  async saveSkinFeatures(
    sessionId: number,
    skinFeatures: SkinFeature[],
  ): Promise<QuizSession> {
    return this.saveAnswers(sessionId, {
      skinFeatures,
    });
  }

  async saveLifestyle(
    sessionId: number,
    lifestyle: Lifestyle,
  ): Promise<QuizSession> {
    return this.saveAnswers(sessionId, {
      lifestyle,
    });
  }

  async saveSpfUsage(
    sessionId: number,
    spfUsage: SpfUsage,
  ): Promise<QuizSession> {
    return this.saveAnswers(sessionId, {
      spfUsage,
    });
  }

  async saveProductFormat(
    sessionId: number,
    productFormat: ProductFormat,
  ): Promise<QuizSession> {
    return this.saveAnswers(sessionId, {
      productFormat,
    });
  }

  async getQuizResult(sessionId: number): Promise<QuizResult> {
    const session = await this.getSessionById(sessionId);
    const answers = this.getCompletedAnswersFromSession(session);
    const recommendation = await recommendationService.calculateResult(answers);

    return {
      session,
      answers,
      recommendation,
    };
  }

  async completeQuizSession(
    sessionId: number,
  ): Promise<CompleteQuizSessionResult> {
    const result = await this.getQuizResult(sessionId);

    const completedSession = await quizSessionRepository.complete(sessionId, {
      recommendationRuleId: result.recommendation.ruleId,
    });

    return {
      session: completedSession,
      answers: result.answers,
      recommendation: result.recommendation,
    };
  }

  getCompletedAnswersFromSession(session: QuizSession): CompletedQuizAnswers {
    const answers = this.mapSessionToQuizAnswers(session);

    return completeQuizAnswers(answers);
  }

  private mapSessionToQuizAnswers(session: QuizSession): QuizAnswers {
    return {
      skinType: session.skinType ?? undefined,
      skinFeatures: this.parseSkinFeatures(session.skinFeatures),
      lifestyle:
        session.lifestyle && session.lifestyle !== 'any'
          ? session.lifestyle
          : undefined,
      spfUsage: session.spfUsage ?? undefined,
      productFormat: session.productFormat ?? undefined,
    };
  }

  private parseSkinFeatures(value: unknown): SkinFeature[] | undefined {
    if (!Array.isArray(value)) {
      return undefined;
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
}

export const quizService = new QuizService();