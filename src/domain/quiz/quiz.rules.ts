import {
  QUIZ_QUESTIONS,
  QUIZ_TOTAL_STEPS,
  SKIN_FEATURE_PRIORITY,
} from './quiz.constants.js';

import type {
  CompletedQuizAnswers,
  QuizAnswers,
  QuizProgress,
  QuizQuestion,
  QuizQuestionId,
  SkinFeature,
} from './quiz.types.js';

export function getQuizQuestions(): QuizQuestion[] {
  return QUIZ_QUESTIONS;
}

export function getQuizQuestionByStep(step: number): QuizQuestion {
  const question = QUIZ_QUESTIONS.find((item) => item.step === step);

  if (!question) {
    throw new Error(`Quiz question with step ${step} was not found`);
  }

  return question;
}

export function getQuizQuestionById(id: QuizQuestionId): QuizQuestion {
  const question = QUIZ_QUESTIONS.find((item) => item.id === id);

  if (!question) {
    throw new Error(`Quiz question with id ${id} was not found`);
  }

  return question;
}

export function getQuizProgress(step: number): QuizProgress {
  return {
    currentStep: step,
    totalSteps: QUIZ_TOTAL_STEPS,
    currentQuestion: getQuizQuestionByStep(step),
  };
}

export function isLastQuizStep(step: number): boolean {
  return step >= QUIZ_TOTAL_STEPS;
}

export function getNextQuizStep(step: number): number {
  if (isLastQuizStep(step)) {
    return QUIZ_TOTAL_STEPS;
  }

  return step + 1;
}

export function normalizeSkinFeaturesSelection(
  currentFeatures: SkinFeature[],
  selectedFeature: SkinFeature,
): SkinFeature[] {
  const hasSelectedFeature = currentFeatures.includes(selectedFeature);

  if (selectedFeature === 'none') {
    return hasSelectedFeature ? [] : ['none'];
  }

  const featuresWithoutNone = currentFeatures.filter(
    (feature) => feature !== 'none',
  );

  if (hasSelectedFeature) {
    const updatedFeatures = featuresWithoutNone.filter(
      (feature) => feature !== selectedFeature,
    );

    return updatedFeatures.length > 0 ? updatedFeatures : [];
  }

  return [...featuresWithoutNone, selectedFeature];
}

export function getPrioritySkinFeature(features: SkinFeature[]): SkinFeature {
  if (features.length === 0) {
    return 'none';
  }

  for (const priorityFeature of SKIN_FEATURE_PRIORITY) {
    if (features.includes(priorityFeature)) {
      return priorityFeature;
    }
  }

  return 'none';
}

export function isQuizCompleted(answers: QuizAnswers): answers is CompletedQuizAnswers {
  return Boolean(
    answers.skinType &&
      answers.skinFeatures &&
      answers.skinFeatures.length > 0 &&
      answers.lifestyle &&
      answers.spfUsage &&
      answers.productFormat,
  );
}

export function completeQuizAnswers(answers: QuizAnswers): CompletedQuizAnswers {
  if (!isQuizCompleted(answers)) {
    throw new Error('Quiz answers are incomplete');
  }

  return {
    skinType: answers.skinType,
    skinFeatures: answers.skinFeatures,
    priorityFeature: getPrioritySkinFeature(answers.skinFeatures),
    lifestyle: answers.lifestyle,
    spfUsage: answers.spfUsage,
    productFormat: answers.productFormat,
  };
}