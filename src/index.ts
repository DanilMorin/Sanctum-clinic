import { startApiServer } from './api/index.js';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { startTelegramBot } from './bot/telegram/index.js';

async function bootstrap(): Promise<void> {
  logger.info('Application starting', {
    apiPort: env.apiPort,
    botEnabled: env.botEnabled,
  });

  startApiServer();

  const telegramBot = await startTelegramBot();

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}. Shutting down...`);

    if (telegramBot) {
      telegramBot.stop(signal);
      logger.info('Telegram bot stopped');
    }

    process.exit(0);
  };

  process.once('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.once('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

bootstrap().catch((error) => {
  logger.error('Application startup error', error);
  process.exit(1);
});