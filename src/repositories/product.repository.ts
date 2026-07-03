import type { Product, ProductCategory } from '@prisma/client';

import { prisma } from '../lib/prisma.js';

export class ProductRepository {
  async findById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: {
        id,
      },
    });
  }

  async findMany(): Promise<Product[]> {
    return prisma.product.findMany({
      orderBy: [
        {
          category: 'asc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findManyByCategory(category: ProductCategory): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        category,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findByName(name: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        name,
      },
    });
  }
}

export const productRepository = new ProductRepository();