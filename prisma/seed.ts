import { PrismaClient } from '@prisma/client';

import { loadCatalog } from '../src/catalog/catalog.io.js';
import { syncCatalog } from '../src/catalog/catalog.sync.js';

const prisma = new PrismaClient();

async function clearSeedData(): Promise<void> {
  await prisma.quizSession.deleteMany();
  await prisma.recommendationAlternative.deleteMany();
  await prisma.recommendationRule.deleteMany();
  await prisma.product.deleteMany();
}

async function main(): Promise<void> {
  console.log('Seeding database from the versioned SPF catalog...');

  const catalog = loadCatalog();

  await clearSeedData();

  const result = await syncCatalog(prisma, catalog);

  console.log('Seed completed.');
  console.log(`Products: ${result.productsProcessed}`);
  console.log(`Recommendation rules: ${result.rulesProcessed}`);
  console.log(`Alternatives: ${result.alternativesProcessed}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
