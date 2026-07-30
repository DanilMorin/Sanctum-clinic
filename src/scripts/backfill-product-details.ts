import { PrismaClient } from '@prisma/client';

import { productDetailsByName } from '../domain/product/product-details.js';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  let updatedProducts = 0;

  for (const [name, details] of Object.entries(productDetailsByName)) {
    const product = await prisma.product.findFirst({
      where: { name },
    });

    if (!product) {
      continue;
    }

    const data = {
      brand: product.brand ?? details.brand,
      spf: product.spf ?? details.spf,
      texture: product.texture ?? details.texture,
      isMakeupBase: product.isMakeupBase ?? details.isMakeupBase,
      description: product.description ?? details.description,
    };

    const hasChanges =
      data.brand !== product.brand ||
      data.spf !== product.spf ||
      data.texture !== product.texture ||
      data.isMakeupBase !== product.isMakeupBase ||
      data.description !== product.description;

    if (!hasChanges) {
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data,
    });

    updatedProducts += 1;
  }

  console.log(`Product details backfill completed. Updated: ${updatedProducts}`);
}

main()
  .catch((error) => {
    console.error('Product details backfill failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
