/*
простая логика чтения продуктов, для того чтобы собрать быстрее MVP
*/
import type { Product, ProductCategory } from '@prisma/client';
import { productRepository } from '../repositories/product.repository.js';

export class ProductService {
  async getProductById(id: number): Promise<Product> {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error(`Product with id ${id} was not found`);
    }

    return product;
  }

  async getProducts(): Promise<Product[]> {
    return productRepository.findMany();
  }

  async getProductsByCategory(
    category: ProductCategory,
  ): Promise<Product[]> {
    return productRepository.findManyByCategory(category);
  }

  async findProductByName(name: string): Promise<Product | null> {
    return productRepository.findByName(name);
  }
}

export const productService = new ProductService();