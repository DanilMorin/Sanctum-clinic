export type QuizCallback =
  | {
      type: 'start';
    }
  | {
      type: 'answer';
      sessionId: number;
      step: number;
      value: string;
    }
  | {
      type: 'feature';
      sessionId: number;
      value: string;
    }
  | {
      type: 'next';
      sessionId: number;
      step: number;
    }
  | {
      type: 'restart';
    }
  | {
      type: 'unknown';
    };

export function parseQuizCallback(data: string): QuizCallback {
  if (data === 'quiz:start') {
    return {
      type: 'start',
    };
  }

  if (data === 'quiz:restart') {
    return {
      type: 'restart',
    };
  }

  const parts = data.split(':');

  if (parts[0] !== 'quiz') {
    return {
      type: 'unknown',
    };
  }

  if (parts[1] === 'answer') {
    const sessionId = Number(parts[2]);
    const step = Number(parts[3]);
    const value = parts[4];

    if (!sessionId || !step || !value) {
      return {
        type: 'unknown',
      };
    }

    return {
      type: 'answer',
      sessionId,
      step,
      value,
    };
  }

  if (parts[1] === 'feature') {
    const sessionId = Number(parts[2]);
    const value = parts[3];

    if (!sessionId || !value) {
      return {
        type: 'unknown',
      };
    }

    return {
      type: 'feature',
      sessionId,
      value,
    };
  }

  if (parts[1] === 'next') {
    const sessionId = Number(parts[2]);
    const step = Number(parts[3]);

    if (!sessionId || !step) {
      return {
        type: 'unknown',
      };
    }

    return {
      type: 'next',
      sessionId,
      step,
    };
  }

  return {
    type: 'unknown',
  };
}