import { PrismaClient } from '@prisma/client';

import { loadCatalog } from '../catalog/catalog.io.js';
import { syncCatalog } from '../catalog/catalog.sync.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const catalog = loadCatalog();
  const result = await syncCatalog(prisma, catalog);

  console.log('Синхронизация каталога завершена.');
  console.log(`Товаров обработано: ${result.productsProcessed}`);
  console.log(`Правил обработано: ${result.rulesProcessed}`);
  console.log(
    `Альтернатив обработано: ${result.alternativesProcessed}`,
  );
  console.log(
    `Устаревших правил деактивировано: ${result.rulesDeactivated}`,
  );
}

main()
  .catch((error) => {
    console.error('Синхронизация каталога завершилась с ошибкой:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
