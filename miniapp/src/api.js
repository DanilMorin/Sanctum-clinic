import { config } from './config.js';

async function request(path, options = {}) {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'API request failed');
  }

  return data;
}

export function getQuestions() {
  return request('/api/quiz/questions');
}

export function createQuizSession(payload) {
  return request('/api/quiz/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateQuizAnswers(sessionId, answers) {
  return request(`/api/quiz/sessions/${sessionId}/answers`, {
    method: 'PATCH',
    body: JSON.stringify(answers),
  });
}

export function completeQuizSession(sessionId) {
  return request(`/api/quiz/sessions/${sessionId}/complete`, {
    method: 'POST',
  });
}
