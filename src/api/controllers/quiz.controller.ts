import type { Request, Response } from 'express';

import { getQuizQuestions } from '../../domain/quiz/quiz.rules.js';
import { quizService } from '../../services/quiz.service.js';
import { userService } from '../../services/user.service.js';
import {
  createQuizSessionSchema,
  updateQuizAnswersSchema,
} from '../dto/quiz.dto.js';
import { toQuizResultDto } from '../dto/result.dto.js';

function getSessionId(req: Request): number {
  const sessionId = Number(req.params.id);

  if (!sessionId) {
    throw new Error('Invalid quiz session id');
  }

  return sessionId;
}

export class QuizController {
  async getQuestions(_req: Request, res: Response): Promise<void> {
    res.json({
      questions: getQuizQuestions(),
    });
  }

  async createSession(req: Request, res: Response): Promise<void> {
    const dto = createQuizSessionSchema.parse(req.body);

    let userId = dto.userId;

    if (!userId && dto.telegramUser) {
      const user = await userService.getOrCreateTelegramUser(dto.telegramUser);
      userId = user.id;
    }

    if (!userId) {
      res.status(400).json({
        error: 'userId or telegramUser is required',
      });

      return;
    }

    const session = await quizService.startQuiz(userId);

    res.status(201).json({
      session,
    });
  }

  async getSession(req: Request, res: Response): Promise<void> {
    const sessionId = getSessionId(req);
    const session = await quizService.getSessionById(sessionId);

    res.json({
      session,
    });
  }

  async updateAnswers(req: Request, res: Response): Promise<void> {
    const sessionId = getSessionId(req);
    const dto = updateQuizAnswersSchema.parse(req.body);

    const session = await quizService.saveAnswers(sessionId, dto);

    res.json({
      session,
    });
  }

  async completeSession(req: Request, res: Response): Promise<void> {
    const sessionId = getSessionId(req);
    const result = await quizService.completeQuizSession(sessionId);

    res.json(toQuizResultDto(result));
  }

  async getResult(req: Request, res: Response): Promise<void> {
    const sessionId = getSessionId(req);
    const result = await quizService.getQuizResult(sessionId);

    res.json(toQuizResultDto(result));
  }
}

export const quizController = new QuizController();