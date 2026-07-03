import type {
  QuizQuestion,
  QuizOption,
  SkinFeature,
} from '../../../domain/quiz/quiz.types.js';

function createOptionButton(
  sessionId: number,
  step: number,
  option: QuizOption,
) {
  return [
    {
      text: option.label,
      callback_data: `quiz:answer:${sessionId}:${step}:${option.value}`,
    },
  ];
}

export function buildSingleChoiceKeyboard(
  sessionId: number,
  question: QuizQuestion,
) {
  return {
    inline_keyboard: question.options.map((option) =>
      createOptionButton(sessionId, question.step, option),
    ),
  };
}

export function buildSkinFeaturesKeyboard(
  sessionId: number,
  question: QuizQuestion,
  selectedFeatures: SkinFeature[],
) {
  const optionRows = question.options.map((option) => {
    const isSelected = selectedFeatures.includes(option.value as SkinFeature);
    const prefix = isSelected ? '✅ ' : '';

    return [
      {
        text: `${prefix}${option.label}`,
        callback_data: `quiz:feature:${sessionId}:${option.value}`,
      },
    ];
  });

  const navigationRows = selectedFeatures.length
    ? [
        [
          {
            text: 'Далее',
            callback_data: `quiz:next:${sessionId}:${question.step}`,
          },
        ],
      ]
    : [];

  return {
    inline_keyboard: [...optionRows, ...navigationRows],
  };
}

export function buildRestartKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: 'Пройти заново',
          callback_data: 'quiz:restart',
        },
      ],
    ],
  };
}