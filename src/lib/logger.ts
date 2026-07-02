type LogMeta = Record<string, unknown>;

function formatMeta(meta?: LogMeta): string {
  if (!meta) {
    return '';
  }

  return ` ${JSON.stringify(meta)}`;
}

export const logger = {
  info(message: string, meta?: LogMeta): void {
    console.log(`[INFO] ${message}${formatMeta(meta)}`);
  },

  warn(message: string, meta?: LogMeta): void {
    console.warn(`[WARN] ${message}${formatMeta(meta)}`);
  },

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      return;
    }

    console.error(`[ERROR] ${message}`, error);
  },
};