import type { Request, Response } from 'express';

import { productService } from '../../services/product.service.js';
import { toProductDto } from '../dto/result.dto.js';

function getProductId(req: Request): number {
  const productId = Number(req.params.id);

  if (!productId) {
    throw new Error('Invalid product id');
  }

  return productId;
}

export class ProductController {
  async getProducts(_req: Request, res: Response): Promise<void> {
    const products = await productService.getProducts();

    res.json({
      products: products.map(toProductDto),
    });
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    const productId = getProductId(req);
    const product = await productService.getProductById(productId);

    res.json({
      product: toProductDto(product),
    });
  }
}

export const productController = new ProductController();