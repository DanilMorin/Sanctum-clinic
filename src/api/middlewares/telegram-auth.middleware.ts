import type { NextFunction, Request, Response } from 'express';

export function telegramAuthMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  // TODO
  // Verify Telegram Mini App initData here.
  next();
}