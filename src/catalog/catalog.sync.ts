import type { Prisma, PrismaClient } from '@prisma/client';

import type {
  CatalogProduct,
  CatalogRule,
  SpfCatalog,
} from './catalog.types.js';

export interface CatalogSyncResult {
  productsProcessed: number;
  rulesProcessed: number;
  alternativesProcessed: number;
  rulesDeactivated: number;
}

async function syncProduct(
  tx: Prisma.TransactionClient,
  product: CatalogProduct,
): Promise<number> {
  const existingProducts = await tx.product.findMany({
    where: { name: product.name },
    take: 2,
  });

  if (existingProducts.length > 1) {
    throw new Error(
      `В базе найдено несколько товаров с названием "${product.name}".`,
    );
  }

  const existingProduct = existingProducts[0];
  const data = {
    brand: product.brand,
    category: product.category,
    spf: product.spf,
    texture: product.texture,
    isMakeupBase: product.isMakeupBase,
    description: product.description,
    doctorComment:
      product.doctorComment ?? existingProduct?.doctorComment ?? null,
    imageUrl: product.imageUrl ?? existingProduct?.imageUrl ?? null,
  };

  if (existingProduct) {
    const updatedProduct = await tx.product.update({
      where: { id: existingProduct.id },
      data,
    });

    return updatedProduct.id;
  }

  const createdProduct = await tx.product.create({
    data: {
      name: product.name,
      ...data,
    },
  });

  return createdProduct.id;
}

function getProductId(
  productIdsByName: Map<string, number>,
  productName: string | null,
): number | null {
  if (!productName) {
    return null;
  }

  const productId = productIdsByName.get(productName);

  if (!productId) {
    throw new Error(`Товар "${productName}" не найден при синхронизации.`);
  }

  return productId;
}

async function syncRule(
  tx: Prisma.TransactionClient,
  rule: CatalogRule,
  productIdsByName: Map<string, number>,
): Promise<{ ruleId: number; alternativesProcessed: number }> {
  const recommendationRule = await tx.recommendationRule.upsert({
    where: {
      skinType_priorityFeature_lifestyle: {
        skinType: rule.skinType,
        priorityFeature: rule.priorityFeature,
        lifestyle: rule.lifestyle,
      },
    },
    update: {
      isActive: true,
      mainProductId: getProductId(
        productIdsByName,
        rule.mainProduct,
      ),
      professionalProductId: getProductId(
        productIdsByName,
        rule.professionalProduct,
      ),
    },
    create: {
      skinType: rule.skinType,
      priorityFeature: rule.priorityFeature,
      lifestyle: rule.lifestyle,
      isActive: true,
      mainProductId: getProductId(
        productIdsByName,
        rule.mainProduct,
      ),
      professionalProductId: getProductId(
        productIdsByName,
        rule.professionalProduct,
      ),
    },
  });

  await tx.recommendationAlternative.deleteMany({
    where: {
      recommendationRuleId: recommendationRule.id,
    },
  });

  if (rule.alternatives.length) {
    await tx.recommendationAlternative.createMany({
      data: rule.alternatives.map((productName, index) => ({
        recommendationRuleId: recommendationRule.id,
        productId: getProductId(productIdsByName, productName) as number,
        sortOrder: index + 1,
      })),
    });
  }

  return {
    ruleId: recommendationRule.id,
    alternativesProcessed: rule.alternatives.length,
  };
}

export async function syncCatalog(
  prisma: PrismaClient,
  catalog: SpfCatalog,
): Promise<CatalogSyncResult> {
  return prisma.$transaction(
    async (tx) => {
      const productIdsByName = new Map<string, number>();

      for (const product of catalog.products) {
        const productId = await syncProduct(tx, product);
        productIdsByName.set(product.name, productId);
      }

      let alternativesProcessed = 0;
      const activeRuleIds: number[] = [];

      for (const rule of catalog.rules) {
        const ruleResult = await syncRule(
          tx,
          rule,
          productIdsByName,
        );
        alternativesProcessed += ruleResult.alternativesProcessed;
        activeRuleIds.push(ruleResult.ruleId);
      }

      const deactivatedRules = await tx.recommendationRule.updateMany({
        where: {
          isActive: true,
          id: {
            notIn: activeRuleIds,
          },
        },
        data: {
          isActive: false,
        },
      });

      return {
        productsProcessed: catalog.products.length,
        rulesProcessed: catalog.rules.length,
        alternativesProcessed,
        rulesDeactivated: deactivatedRules.count,
      };
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    },
  );
}
