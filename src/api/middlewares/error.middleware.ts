import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../../lib/logger.js';

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
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