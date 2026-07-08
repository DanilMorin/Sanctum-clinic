import {
  Lifestyle,
  PrismaClient,
  ProductCategory,
  SkinFeature,
  SkinType,
} from '@prisma/client';

const prisma = new PrismaClient();

interface SeedRule {
  skinType: SkinType;
  priorityFeature: SkinFeature;
  lifestyle: Lifestyle;
  mainProduct: string;
  alternatives: string[];
  professionalProduct: string;
}

const seedRules: SeedRule[] = [
  {
    skinType: 'oily',
    priorityFeature: 'none',
    lifestyle: 'normal',
    mainProduct: 'VICHY Ideal Soleil матирующая SPF30',
    alternatives: ['La Roche-Posay Anthelios спрей-вуаль SPF50'],
    professionalProduct: 'HydroPeptide Solar Defense Non-Tinted SPF50',
  },
  {
    skinType: 'oily',
    priorityFeature: 'none',
    lifestyle: 'active',
    mainProduct: 'La Roche-Posay Anthelios спрей-вуаль SPF50',
    alternatives: ['VICHY Ideal Soleil матирующая SPF30'],
    professionalProduct: 'HydroPeptide Solar Defense Non-Tinted SPF50',
  },
  {
    skinType: 'oily',
    priorityFeature: 'acne',
    lifestyle: 'normal',
    mainProduct: 'VICHY UV-Clear SPF50+',
    alternatives: [
      'SVR Sebiaclear SPF50',
      'VICHY Capital Soleil флюид SPF50',
      'VICHY Ideal Soleil SPF30',
    ],
    professionalProduct: 'HydroPeptide Solar Defense Non-Tinted SPF50',
  },
  {
    skinType: 'oily',
    priorityFeature: 'acne',
    lifestyle: 'active',
    mainProduct: 'La Roche-Posay Anthelios спрей-вуаль SPF50',
    alternatives: ['Avene Sport Fluid SPF50'],
    professionalProduct: 'HydroPeptide Solar Defense Non-Tinted SPF50',
  },
  {
    skinType: 'oily',
    priorityFeature: 'rosacea',
    lifestyle: 'any',
    mainProduct: 'La Roche-Posay Anthelios спрей-вуаль SPF50',
    alternatives: [],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },
  {
    skinType: 'oily',
    priorityFeature: 'couperose',
    lifestyle: 'any',
    mainProduct: 'BIODERMA Photoderm Ultra-Fluid AR+ SPF50',
    alternatives: [],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },
  {
    skinType: 'oily',
    priorityFeature: 'pigmentation',
    lifestyle: 'any',
    mainProduct: 'Vichy UV Age-Daily SPF50+',
    alternatives: [
      'Eucerin Anti-Pigment SPF30',
      'La Roche-Posay Age Correct',
    ],
    professionalProduct: 'SkinCeuticals Brightening UV Defense SPF30',
  },

  {
    skinType: 'combination',
    priorityFeature: 'none',
    lifestyle: 'any',
    mainProduct: 'La Roche-Posay Anthelios невидимый флюид SPF50',
    alternatives: [
      'VICHY Capital Soleil эмульсия SPF50',
      'VICHY Ideal Soleil SPF30',
      'BIODERMA Xdefense Ultra Fluid',
    ],
    professionalProduct: 'HydroPeptide Solar Defense Tinted SPF30',
  },
  {
    skinType: 'combination',
    priorityFeature: 'acne',
    lifestyle: 'normal',
    mainProduct: 'SVR Sebiaclear SPF50',
    alternatives: [
      'VICHY Capital Soleil флюид SPF50',
      'VICHY Ideal Soleil SPF30',
    ],
    professionalProduct: 'HydroPeptide Solar Defense Non-Tinted SPF50',
  },
  {
    skinType: 'combination',
    priorityFeature: 'acne',
    lifestyle: 'active',
    mainProduct: 'La Roche-Posay Anthelios спрей-вуаль SPF50',
    alternatives: ['Avene Sport Fluid SPF50'],
    professionalProduct: 'HydroPeptide Solar Defense Non-Tinted SPF50',
  },
  {
    skinType: 'combination',
    priorityFeature: 'rosacea',
    lifestyle: 'any',
    mainProduct: 'La Roche-Posay Anthelios спрей-вуаль SPF50',
    alternatives: [],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },
  {
    skinType: 'combination',
    priorityFeature: 'couperose',
    lifestyle: 'any',
    mainProduct: 'BIODERMA Photoderm Ultra-Fluid AR+ SPF50',
    alternatives: [
      'La Roche-Posay Anthelios спрей-вуаль SPF50',
      'VICHY спрей анти-песок SPF50',
    ],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },
  {
    skinType: 'combination',
    priorityFeature: 'pigmentation',
    lifestyle: 'any',
    mainProduct: 'Vichy UV Age-Daily SPF50+',
    alternatives: [
      'Eucerin Anti-Pigment SPF30',
      'La Roche-Posay Age Correct',
    ],
    professionalProduct: 'SkinCeuticals Brightening UV Defense SPF30',
  },
  {
    skinType: 'combination',
    priorityFeature: 'sensitive',
    lifestyle: 'any',
    mainProduct: 'SVR Sensifine AR SPF50',
    alternatives: [
      'Avene Cicalfate+ SPF50',
      'VICHY Capital Soleil эмульсия SPF50',
    ],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },

  {
    skinType: 'dry',
    priorityFeature: 'none',
    lifestyle: 'normal',
    mainProduct: 'Bioderma Hydrabio Perfecteur SPF30',
    alternatives: [
      'SVR Sensifine AR SPF50',
      'La Roche-Posay Anthelios невидимый флюид SPF50',
      'VICHY Capital Soleil эмульсия SPF50',
      'BIODERMA Xdefense Ultra Fluid',
    ],
    professionalProduct: 'YU.R CCC крем SPF50',
  },
  {
    skinType: 'dry',
    priorityFeature: 'none',
    lifestyle: 'active',
    mainProduct: 'VICHY спрей анти-песок SPF50',
    alternatives: ['Avene Sport Fluid SPF50'],
    professionalProduct: 'HydroPeptide Solar Defense Non-Tinted SPF50',
  },
  {
    skinType: 'dry',
    priorityFeature: 'sensitive',
    lifestyle: 'normal',
    mainProduct: 'SVR Sensifine AR SPF50',
    alternatives: [
      'Avene Cicalfate+ SPF50',
      'La Roche-Posay Anthelios невидимый флюид SPF50',
      'VICHY Capital Soleil эмульсия SPF50',
    ],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },
  {
    skinType: 'dry',
    priorityFeature: 'sensitive',
    lifestyle: 'active',
    mainProduct: 'VICHY спрей анти-песок SPF50',
    alternatives: ['Avene Sport Fluid SPF50'],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },
  {
    skinType: 'dry',
    priorityFeature: 'rosacea',
    lifestyle: 'any',
    mainProduct: 'SVR Sensifine AR SPF50',
    alternatives: ['Bioderma Hydrabio Perfecteur SPF30'],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },
  {
    skinType: 'dry',
    priorityFeature: 'couperose',
    lifestyle: 'any',
    mainProduct: 'BIODERMA Photoderm Ultra-Fluid AR+ SPF50',
    alternatives: ['Avene Cicalfate+ SPF50'],
    professionalProduct: 'IS Clinical Eclipse SPF50+',
  },
  {
    skinType: 'dry',
    priorityFeature: 'pigmentation',
    lifestyle: 'any',
    mainProduct: 'Vichy UV Age-Daily SPF50+',
    alternatives: ['Bioderma Hydrabio Perfecteur SPF30'],
    professionalProduct: 'SkinCeuticals Brightening UV Defense SPF30',
  },
];

function getProfessionalProductNames(): Set<string> {
  return new Set(seedRules.map((rule) => rule.professionalProduct));
}

function getAllProductNames(): string[] {
  const names = new Set<string>();

  for (const rule of seedRules) {
    names.add(rule.mainProduct);
    names.add(rule.professionalProduct);

    for (const alternative of rule.alternatives) {
      names.add(alternative);
    }
  }

  return Array.from(names);
}

function detectBrand(productName: string): string | null {
  const brandPatterns: Array<[string, string]> = [
    ['La Roche-Posay', 'La Roche-Posay'],
    ['LRP', 'La Roche-Posay'],
    ['VICHY', 'VICHY'],
    ['Vichy', 'VICHY'],
    ['BIODERMA', 'BIODERMA'],
    ['Bioderma', 'BIODERMA'],
    ['SVR', 'SVR'],
    ['Avene', 'Avene'],
    ['Eucerin', 'Eucerin'],
    ['HydroPeptide', 'HydroPeptide'],
    ['IS Clinical', 'IS Clinical'],
    ['SkinCeuticals', 'SkinCeuticals'],
    ['YU.R', 'YU.R'],
  ];

  const foundPattern = brandPatterns.find(([pattern]) =>
    productName.includes(pattern),
  );

  return foundPattern ? foundPattern[1] : null;
}

function detectSpf(productName: string): string | null {
  const match = productName.match(/SPF\s?\d+\+?/i);

  return match ? match[0].replace(/\s+/g, '') : null;
}

async function clearSeedData(): Promise<void> {
  await prisma.quizSession.deleteMany();
  await prisma.recommendationAlternative.deleteMany();
  await prisma.recommendationRule.deleteMany();
  await prisma.product.deleteMany();
}

async function seedProducts(): Promise<Map<string, number>> {
  const professionalProductNames = getProfessionalProductNames();
  const allProductNames = getAllProductNames();

  const productIdByName = new Map<string, number>();

  for (const productName of allProductNames) {
    const category = professionalProductNames.has(productName)
      ? ProductCategory.professional
      : ProductCategory.pharmacy;

    const product = await prisma.product.create({
      data: {
        name: productName,
        brand: detectBrand(productName),
        category,
        spf: detectSpf(productName),
        texture: null,
        isMakeupBase: null,
        description: null,
        doctorComment: null,
        imageUrl: null,
      },
    });

    productIdByName.set(productName, product.id);
  }

  return productIdByName;
}

function getRequiredProductId(
  productIdByName: Map<string, number>,
  productName: string,
): number {
  const productId = productIdByName.get(productName);

  if (!productId) {
    throw new Error(`Product "${productName}" was not created`);
  }

  return productId;
}

async function seedRecommendationRules(
  productIdByName: Map<string, number>,
): Promise<void> {
  for (const rule of seedRules) {
    const mainProductId = getRequiredProductId(
      productIdByName,
      rule.mainProduct,
    );

    const professionalProductId = getRequiredProductId(
      productIdByName,
      rule.professionalProduct,
    );

    const recommendationRule = await prisma.recommendationRule.create({
      data: {
        skinType: rule.skinType,
        priorityFeature: rule.priorityFeature,
        lifestyle: rule.lifestyle,
        mainProductId,
        professionalProductId,
      },
    });

    for (const [index, alternativeName] of rule.alternatives.entries()) {
      const productId = getRequiredProductId(productIdByName, alternativeName);

      await prisma.recommendationAlternative.create({
        data: {
          recommendationRuleId: recommendationRule.id,
          productId,
          sortOrder: index + 1,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  console.log('Seeding database...');

  await clearSeedData();

  const productIdByName = await seedProducts();

  await seedRecommendationRules(productIdByName);

  console.log('Seed completed.');
  console.log(`Products: ${productIdByName.size}`);
  console.log(`Recommendation rules: ${seedRules.length}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });