import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import {
  RECOMMENDATION_NOT_AVAILABLE_MESSAGE,
  RecommendationRuleNotFoundError,
} from '../../domain/recommendation/recommendation.errors.js';
import { logger } from '../../lib/logger.js';

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof RecommendationRuleNotFoundError) {
    logger.warn(error.message);

    res.status(422).json({
      code: 'RECOMMENDATION_NOT_AVAILABLE',
      error: RECOMMENDATION_NOT_AVAILABLE_MESSAGE,
    });

    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: error.flatten(),
    });

    return;
  }

  if (error instanceof Error) {
    logger.error('API error', error);

    res.status(500).json({
      error: error.message,
    });

    return;
  }

  logger.error('Unknown API error', error);

  res.status(500).json({
    error: 'Internal server error',
  });
}
