/* 
create создаёт новую попытку теста;
updateAnswers сохраняет ответы;
complete завершает тест;
abandonStartedSessionsByUserId закрывает старые незавершённые попытки;
findByIdWithRecommendation понадобится для вывода результата.
*/

import type {
  Lifestyle,
  ProductFormat,
  QuizSession,
  QuizSessionStatus,
  SkinFeature,
  SkinType,
  SpfUsage,
} from '@prisma/client';

import { prisma } from '../lib/prisma.js';

export interface CreateQuizSessionInput {
  userId: number;
}

export interface UpdateQuizSessionAnswersInput {
  skinType?: SkinType;
  skinFeatures?: SkinFeature[];
  priorityFeature?: SkinFeature;
  lifestyle?: Lifestyle;
  spfUsage?: SpfUsage;
  productFormat?: ProductFormat;
}

export interface CompleteQuizSessionInput {
  recommendationRuleId?: number;
}

export class QuizSessionRepository {
  async create(input: CreateQuizSessionInput): Promise<QuizSession> {
    return prisma.quizSession.create({
      data: {
        userId: input.userId,
        status: 'started',
      },
    });
  }

  async findById(id: number): Promise<QuizSession | null> {
    return prisma.quizSession.findUnique({
      where: {
        id,
      },
    });
  }

  async findByIdWithRecommendation(id: number) {
    return prisma.quizSession.findUnique({
      where: {
        id,
      },
      include: {
        recommendationRule: {
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
        },
      },
    });
  }

  async findLatestByUserId(userId: number): Promise<QuizSession | null> {
    return prisma.quizSession.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findLatestStartedByUserId(
    userId: number,
  ): Promise<QuizSession | null> {
    return prisma.quizSession.findFirst({
      where: {
        userId,
        status: 'started',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateAnswers(
    id: number,
    input: UpdateQuizSessionAnswersInput,
  ): Promise<QuizSession> {
    return prisma.quizSession.update({
      where: {
        id,
      },
      data: {
        skinType: input.skinType,
        skinFeatures: input.skinFeatures ?? undefined,
        priorityFeature: input.priorityFeature,
        lifestyle: input.lifestyle,
        spfUsage: input.spfUsage,
        productFormat: input.productFormat,
      },
    });
  }

  async updateStatus(
    id: number,
    status: QuizSessionStatus,
  ): Promise<QuizSession> {
    return prisma.quizSession.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async complete(
    id: number,
    input: CompleteQuizSessionInput,
  ): Promise<QuizSession> {
    return prisma.quizSession.update({
      where: {
        id,
      },
      data: {
        status: 'completed',
        recommendationRuleId: input.recommendationRuleId,
        completedAt: new Date(),
      },
    });
  }

  async abandonStartedSessionsByUserId(userId: number): Promise<number> {
    const result = await prisma.quizSession.updateMany({
      where: {
        userId,
        status: 'started',
      },
      data: {
        status: 'abandoned',
      },
    });

    return result.count;
  }
}

export const quizSessionRepository = new QuizSessionRepository();