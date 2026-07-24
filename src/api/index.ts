import cors from 'cors';
import express from 'express';

import { env } from '../config/env.js';
import { logger } from '../lib/logger.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { productRouter } from './routes/product.routes.js';
import { quizRouter } from './routes/quiz.routes.js';

export function createApiServer() {
  const app = express();
  const webAppOrigin = new URL(env.webAppUrl).origin;

  app.disable('x-powered-by');

  app.use(
    cors({
      origin(origin, callback) {
        callback(null, !origin || origin === webAppOrigin);
      },
      credentials: true,
    }),
  );

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'sanctum-clinic',
    });
  });

  app.use('/api/quiz', quizRouter);
  app.use('/api/products', productRouter);

  app.use(errorMiddleware);

  return app;
}

export function startApiServer(): void {
  const app = createApiServer();

  app.listen(env.apiPort, () => {
    logger.info('API server started', {
      port: env.apiPort,
    });
  });
}
