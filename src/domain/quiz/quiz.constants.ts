import type { QuizQuestion, SkinFeature } from './quiz.types.js';

export const QUIZ_TOTAL_STEPS = 5;

export const QUIZ_PROGRESS_LABELS = [
  'Тип кожи',
  'Особенности',
  'Образ жизни',
  'Использование',
  'Формат',
] as const;

export const SKIN_FEATURE_PRIORITY: SkinFeature[] = [
  'couperose',
  'rosacea',
  'pigmentation',
  'acne',
  'sensitive',
  'none',
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'skin_type',
    step: 1,
    title: 'Какой у вас тип кожи?',
    progressLabel: 'Тип кожи',
    type: 'single',
    options: [
      {
        value: 'oily',
        label: 'Жирная',
        description: 'Блеск, расширенные поры',
      },
      {
        value: 'combination',
        label: 'Комбинированная',
        description: 'Жирная Т-зона, нормальные щёки',
      },
      {
        value: 'dry',
        label: 'Сухая',
        description: 'Ощущение стянутости, шелушение',
      },
    ],
  },
  {
    id: 'skin_features',
    step: 2,
    title: 'Есть ли у вашей кожи особенности?',
    progressLabel: 'Особенности',
    type: 'multiple',
    options: [
      {
        value: 'acne',
        label: 'Акне / высыпания',
      },
      {
        value: 'rosacea',
        label: 'Розацеа',
      },
      {
        value: 'couperose',
        label: 'Купероз',
      },
      {
        value: 'pigmentation',
        label: 'Пигментация',
      },
      {
        value: 'sensitive',
        label: 'Чувствительная / раздражённая',
      },
      {
        value: 'none',
        label: 'Без особенностей',
      },
    ],
  },
  {
    id: 'lifestyle',
    step: 3,
    title: 'Какой у вас образ жизни?',
    progressLabel: 'Образ жизни',
    type: 'single',
    options: [
      {
        value: 'active',
        label: 'Активный',
        description: 'Спорт, много времени на улице, важна стойкость',
      },
      {
        value: 'normal',
        label: 'Обычный',
        description: 'Город, офис, стандартный ритм',
      },
    ],
  },
  {
    id: 'spf_usage',
    step: 4,
    title: 'Как вы планируете использовать SPF?',
    progressLabel: 'Использование',
    type: 'single',
    options: [
      {
        value: 'makeup_base',
        label: 'Как база под макияж',
        description: 'Важна лёгкая текстура, незаметность на коже',
      },
      {
        value: 'standalone',
        label: 'Как самостоятельный уход',
        description: 'Без макияжа или поверх других средств',
      },
    ],
  },
  {
    id: 'product_format',
    step: 5,
    title: 'Какой формат средств вам подходит?',
    progressLabel: 'Формат',
    type: 'single',
    options: [
      {
        value: 'pharmacy',
        label: 'Аптечная косметика',
        description: 'Vichy, La Roche-Posay, Bioderma и другие',
      },
      {
        value: 'professional',
        label: 'Профессиональная косметика',
        description: 'IS Clinical, SkinCeuticals, HydroPeptide и другие',
      },
      {
        value: 'both',
        label: 'Рассмотрю оба варианта',
        description: 'Покажите все подходящие рекомендации',
      },
    ],
  },
];

export const QUIZ_DISCLAIMER =
  'Если вы беременны, кормите грудью или принимаете системные ретиноиды, перед использованием солнцезащитного средства проконсультируйтесь с вашим врачом.';

export const QUIZ_FINAL_CARD_TEXT =
  'Солнцезащитные средства, особенно плотные формулы, важно правильно смывать. Остатки SPF могут забивать поры и снижать эффективность ухода.';