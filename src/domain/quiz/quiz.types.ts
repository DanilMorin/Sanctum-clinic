export type QuizQuestionId =
  | 'skin_type'
  | 'skin_features'
  | 'lifestyle'
  | 'spf_usage'
  | 'product_format';

export type QuizQuestionType = 'single' | 'multiple';

export type SkinType = 'oily' | 'combination' | 'dry';

export type SkinFeature =
  | 'acne'
  | 'rosacea'
  | 'couperose'
  | 'pigmentation'
  | 'sensitive'
  | 'none';

export type Lifestyle = 'active' | 'normal';

export type SpfUsage = 'makeup_base' | 'standalone';

export type ProductFormat = 'pharmacy' | 'professional' | 'both';

export type QuizAnswerValue =
  | SkinType
  | SkinFeature
  | Lifestyle
  | SpfUsage
  | ProductFormat;

export interface QuizOption {
  value: QuizAnswerValue;
  label: string;
  description?: string;
}

export interface QuizQuestion {
  id: QuizQuestionId;
  step: number;
  title: string;
  progressLabel: string;
  type: QuizQuestionType;
  options: QuizOption[];
}

export interface QuizAnswers {
  skinType?: SkinType;
  skinFeatures?: SkinFeature[];
  lifestyle?: Lifestyle;
  spfUsage?: SpfUsage;
  productFormat?: ProductFormat;
}

export interface CompletedQuizAnswers {
  skinType: SkinType;
  skinFeatures: SkinFeature[];
  priorityFeature: SkinFeature;
  lifestyle: Lifestyle;
  spfUsage: SpfUsage;
  productFormat: ProductFormat;
}

export interface QuizProgress {
  currentStep: number;
  totalSteps: number;
  currentQuestion: QuizQuestion;
}