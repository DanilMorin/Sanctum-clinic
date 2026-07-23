export const SCREEN = {
  welcome: 'welcome',
  loading: 'loading',
  question: 'question',
  result: 'result',
  cleansingGuide: 'cleansingGuide',
  final: 'final',
};

export const ANSWER_FIELD_BY_QUESTION_ID = {
  skin_type: 'skinType',
  skin_features: 'skinFeatures',
  lifestyle: 'lifestyle',
  spf_usage: 'spfUsage',
  product_format: 'productFormat',
};

export const RESULT_PROFILE_LABELS = {
  skinType: {
    oily: 'Жирная кожа',
    combination: 'Комбинированная кожа',
    dry: 'Сухая кожа',
  },
  skinFeatures: {
    acne: 'Акне / высыпания',
    rosacea: 'Розацеа',
    couperose: 'Купероз',
    pigmentation: 'Пигментация',
    sensitive: 'Чувствительная кожа',
    none: 'Без особенностей',
  },
  lifestyle: {
    active: 'Активный ритм',
    normal: 'Обычный ритм',
  },
  spfUsage: {
    makeup_base: 'Под макияж',
    standalone: 'Самостоятельный уход',
  },
  productFormat: {
    pharmacy: 'Рассмотрю аптечные варианты',
    professional: 'Рассмотрю профессиональные варианты',
    both: 'Рассмотрю аптечные и профессиональные варианты',
  },
};
