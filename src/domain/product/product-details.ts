export interface ProductDetails {
  brand: string;
  spf: string;
  texture: string;
  isMakeupBase: boolean;
  description: string;
}

const aveneCicalfate: ProductDetails = {
  brand: 'Avène',
  spf: 'SPF50',
  texture: 'Крем',
  isMakeupBase: false,
  description:
    'Восстанавливает защитный барьер и успокаивает раздражённую кожу.',
};

const aveneSportFluid: ProductDetails = {
  brand: 'Avène',
  spf: 'SPF50',
  texture: 'Флюид',
  isMakeupBase: false,
  description:
    'Лёгкий невесомый флюид для занятий спортом на открытом воздухе.',
};

const xdefenseUltraFluid: ProductDetails = {
  brand: 'BIODERMA',
  spf: 'SPF50+',
  texture: 'Флюид',
  isMakeupBase: true,
  description:
    'Ультралёгкий флюид для ежедневной защиты. Хорошая база под макияж.',
};

const ageCorrect: ProductDetails = {
  brand: 'La Roche-Posay',
  spf: 'SPF50',
  texture: 'Флюид',
  isMakeupBase: false,
  description:
    'Средство для ежедневной фотокоррекции, которое помогает бороться с признаками фотостарения и пигментацией.',
};

const idealSoleil: ProductDetails = {
  brand: 'VICHY',
  spf: 'SPF30',
  texture: 'Эмульсия',
  isMakeupBase: true,
  description: 'Матирует кожу в течение дня и помогает контролировать блеск.',
};

export const productDetailsByName: Readonly<
  Record<string, ProductDetails>
> = {
  'Avene Cicalfate+ SPF50': aveneCicalfate,
  'Avène Cicalfate+ SPF50': aveneCicalfate,
  'Avene Sport Fluid SPF50': aveneSportFluid,
  'Avène Sport Fluid SPF50': aveneSportFluid,
  'BIODERMA Photoderm Ultra-Fluid AR+ SPF50': {
    brand: 'BIODERMA',
    spf: 'SPF50',
    texture: 'Флюид',
    isMakeupBase: true,
    description:
      'Средство для кожи с куперозом, которое помогает укрепить сосудистую стенку.',
  },
  'BIODERMA Xdefense Ultra Fluid': xdefenseUltraFluid,
  'BIODERMA Photoderm Xdefense Ultra Fluid': xdefenseUltraFluid,
  'Bioderma Hydrabio Perfecteur SPF30': {
    brand: 'BIODERMA',
    spf: 'SPF30',
    texture: 'Крем',
    isMakeupBase: true,
    description:
      'Увлажняет кожу и придаёт сияние. Подходит для сухой кожи с пигментацией.',
  },
  'Eucerin Anti-Pigment SPF30': {
    brand: 'Eucerin',
    spf: 'SPF30',
    texture: 'Крем',
    isMakeupBase: false,
    description: 'Помогает уменьшить пигментные пятна и выровнять тон кожи.',
  },
  'HydroPeptide Solar Defense Non-Tinted SPF50': {
    brand: 'HydroPeptide',
    spf: 'SPF50',
    texture: 'Флюид',
    isMakeupBase: true,
    description:
      'Защита на физических фильтрах с матирующим эффектом. Подходит для чувствительной кожи.',
  },
  'HydroPeptide Solar Defense Tinted SPF30': {
    brand: 'HydroPeptide',
    spf: 'SPF30',
    texture: 'Крем',
    isMakeupBase: true,
    description:
      'Цветовые сферы подстраиваются под тон кожи. Средство быстро впитывается и не оставляет белого налёта.',
  },
  'IS Clinical Eclipse SPF50+': {
    brand: 'IS Clinical',
    spf: 'SPF50+',
    texture: 'Крем',
    isMakeupBase: true,
    description:
      'Физические фильтры с витамином Е, ультралёгкая текстура и здоровое сияние. Подходит как база под макияж.',
  },
  'La Roche-Posay Age Correct': ageCorrect,
  'La Roche-Posay Anthelios Age Correct': ageCorrect,
  'La Roche-Posay Anthelios невидимый флюид SPF50': {
    brand: 'La Roche-Posay',
    spf: 'SPF50',
    texture: 'Флюид',
    isMakeupBase: true,
    description:
      'Невидимый на коже флюид с деликатной формулой для чувствительной кожи.',
  },
  'La Roche-Posay Anthelios спрей-вуаль SPF50': {
    brand: 'La Roche-Posay',
    spf: 'SPF50',
    texture: 'Спрей',
    isMakeupBase: false,
    description:
      'Стойкий невесомый спрей, которым удобно обновлять защиту в течение дня.',
  },
  'SVR Sebiaclear SPF50': {
    brand: 'SVR',
    spf: 'SPF50',
    texture: 'Флюид',
    isMakeupBase: true,
    description:
      'Матирует, не забивает поры и помогает бороться с несовершенствами.',
  },
  'SVR Sensifine AR SPF50': {
    brand: 'SVR',
    spf: 'SPF50',
    texture: 'Крем',
    isMakeupBase: true,
    description:
      'Уменьшает покраснения и бережно ухаживает за чувствительной кожей.',
  },
  'SkinCeuticals Brightening UV Defense SPF30': {
    brand: 'SkinCeuticals',
    spf: 'SPF30',
    texture: 'Флюид',
    isMakeupBase: true,
    description:
      'Увлажняет, выравнивает тон и придаёт сияние. Помогает уменьшить пигментные пятна.',
  },
  'VICHY Capital Soleil флюид SPF50': {
    brand: 'VICHY',
    spf: 'SPF50',
    texture: 'Флюид',
    isMakeupBase: false,
    description:
      'Лёгкий флюид для комбинированной кожи, склонной к появлению несовершенств.',
  },
  'VICHY Capital Soleil эмульсия SPF50': {
    brand: 'VICHY',
    spf: 'SPF50',
    texture: 'Эмульсия',
    isMakeupBase: true,
    description:
      'Лёгкая увлажняющая текстура, подходящая для сухой чувствительной кожи.',
  },
  'VICHY Ideal Soleil SPF30': idealSoleil,
  'VICHY Ideal Soleil матирующая SPF30': idealSoleil,
  'VICHY UV-Clear SPF50+': {
    brand: 'VICHY',
    spf: 'SPF50+',
    texture: 'Флюид',
    isMakeupBase: true,
    description:
      'Средство для проблемной кожи, которое не забивает поры и помогает уменьшить несовершенства.',
  },
  'VICHY спрей анти-песок SPF50': {
    brand: 'VICHY',
    spf: 'SPF50',
    texture: 'Спрей',
    isMakeupBase: false,
    description:
      'Водостойкий солнцезащитный спрей с бережной формулой для чувствительной кожи.',
  },
  'Vichy UV Age-Daily SPF50+': {
    brand: 'VICHY',
    spf: 'SPF50+',
    texture: 'Флюид',
    isMakeupBase: true,
    description:
      'Помогает бороться с пигментацией и признаками фотостарения, выравнивает тон кожи.',
  },
  'YU.R CCC крем SPF50': {
    brand: 'YU.R',
    spf: 'SPF50',
    texture: 'Крем',
    isMakeupBase: true,
    description:
      'Корректирующий увлажняющий крем с ровным естественным оттенком без серого подтона.',
  },
};
