import { PrismaClient } from '@prisma/client';

import { loadCatalog } from '../catalog/catalog.io.js';
import { generateCatalog } from '../catalog/catalog.pipeline.js';
import { syncCatalog } from '../catalog/catalog.sync.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  generateCatalog();

  const catalog = loadCatalog();
  const result = await syncCatalog(prisma, catalog);

  console.log(
    'Excel, JSON-каталог и локальная БД синхронизированы.',
  );
  console.log(`Товаров обработано: ${result.productsProcessed}`);
  console.log(`Правил обработано: ${result.rulesProcessed}`);
}

main()
  .catch((error) => {
    console.error('Обновление каталога завершилось с ошибкой:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
