import {
  ANSWER_FIELD_BY_QUESTION_ID,
  RESULT_PROFILE_LABELS,
  SCREEN,
} from '../../constants/quiz.js';

export function createInitialAnswers() {
  return {
    skinType: undefined,
    skinFeatures: [],
    lifestyle: undefined,
    spfUsage: undefined,
    productFormat: undefined,
  };
}

export function createInitialQuizState() {
  return {
    screen: SCREEN.welcome,
    questions: [],
    sessionId: null,
    currentStepIndex: 0,
    answers: createInitialAnswers(),
    result: null,
    isLoading: false,
    error: null,
  };
}

export function getAnswerField(question) {
  return question ? ANSWER_FIELD_BY_QUESTION_ID[question.id] : undefined;
}

export function getCurrentQuestion(state) {
  return state.questions[state.currentStepIndex];
}

export function isMultipleQuestion(question) {
  return question?.type === 'multiple';
}

export function isQuestionAnswered(question, answers) {
  const answerField = getAnswerField(question);

  if (!answerField) {
    return false;
  }

  const answer = answers[answerField];

  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return Boolean(answer);
}

export function normalizeFeatureSelection(currentFeatures, selectedFeature) {
  const hasFeature = currentFeatures.includes(selectedFeature);

  if (selectedFeature === 'none') {
    return hasFeature ? [] : ['none'];
  }

  const featuresWithoutNone = currentFeatures.filter(
    (feature) => feature !== 'none',
  );

  if (hasFeature) {
    return featuresWithoutNone.filter((feature) => feature !== selectedFeature);
  }

  return [...featuresWithoutNone, selectedFeature];
}

export function getResultProfileTags(answers) {
  const featureTags = answers.skinFeatures.map(
    (feature) => RESULT_PROFILE_LABELS.skinFeatures[feature],
  );

  return [
    RESULT_PROFILE_LABELS.skinType[answers.skinType],
    ...featureTags,
    RESULT_PROFILE_LABELS.lifestyle[answers.lifestyle],
    RESULT_PROFILE_LABELS.spfUsage[answers.spfUsage],
    RESULT_PROFILE_LABELS.productFormat[answers.productFormat],
  ].filter(Boolean);
}

export function formatSpfLabel(spf) {
  return spf?.replace(/SPF\s*(\d+)/i, 'SPF $1');
}

export function getProductTags(product) {
  if (!product) {
    return [];
  }

  const textureLabel = product.texture
    ? `${product.texture}${product.texture.toLowerCase().includes('текстур') ? '' : ' текстура'}`
    : null;
  const makeupBaseLabel =
    product.isMakeupBase === null || product.isMakeupBase === undefined
      ? null
      : `Под макияж: ${product.isMakeupBase ? 'да' : 'нет'}`;

  return [formatSpfLabel(product.spf), textureLabel, makeupBaseLabel].filter(
    Boolean,
  );
}
