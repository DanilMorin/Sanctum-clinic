import { Router } from 'express';

import { quizController } from '../controllers/quiz.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';

export const quizRouter = Router();

quizRouter.get(
  '/questions',
  asyncHandler((req, res) => quizController.getQuestions(req, res)),
);

quizRouter.post(
  '/sessions',
  asyncHandler((req, res) => quizController.createSession(req, res)),
);

quizRouter.get(
  '/sessions/:id',
  asyncHandler((req, res) => quizController.getSession(req, res)),
);

quizRouter.patch(
  '/sessions/:id/answers',
  asyncHandler((req, res) => quizController.updateAnswers(req, res)),
);

quizRouter.post(
  '/sessions/:id/complete',
  asyncHandler((req, res) => quizController.completeSession(req, res)),
);

quizRouter.get(
  '/sessions/:id/result',
  asyncHandler((req, res) => quizController.getResult(req, res)),
);
