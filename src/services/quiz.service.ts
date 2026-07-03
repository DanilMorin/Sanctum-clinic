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

export interface CompleteQuizSessionResult {
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

  async saveSkinType(
    sessionId: number,
    skinType: SkinType,
  ): Promise<QuizSession> {
    return quizSessionRepository.updateAnswers(sessionId, {
      skinType,
    });
  }

  async saveSkinFeatures(
    sessionId: number,
    skinFeatures: SkinFeature[],
  ): Promise<QuizSession> {
    return quizSessionRepository.updateAnswers(sessionId, {
      skinFeatures,
      priorityFeature: getPrioritySkinFeature(skinFeatures),
    });
  }

  async saveLifestyle(
    sessionId: number,
    lifestyle: Lifestyle,
  ): Promise<QuizSession> {
    return quizSessionRepository.updateAnswers(sessionId, {
      lifestyle,
    });
  }

  async saveSpfUsage(
    sessionId: number,
    spfUsage: SpfUsage,
  ): Promise<QuizSession> {
    return quizSessionRepository.updateAnswers(sessionId, {
      spfUsage,
    });
  }

  async saveProductFormat(
    sessionId: number,
    productFormat: ProductFormat,
  ): Promise<QuizSession> {
    return quizSessionRepository.updateAnswers(sessionId, {
      productFormat,
    });
  }

  async completeQuizSession(
    sessionId: number,
  ): Promise<CompleteQuizSessionResult> {
    const session = await this.getSessionById(sessionId);
    const answers = this.mapSessionToQuizAnswers(session);
    const completedAnswers = completeQuizAnswers(answers);

    const recommendation =
      await recommendationService.calculateResult(completedAnswers);

    const completedSession = await quizSessionRepository.complete(sessionId, {
      recommendationRuleId: recommendation.ruleId,
    });

    return {
      session: completedSession,
      answers: completedAnswers,
      recommendation,
    };
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