import { Router } from 'express';

import { productController } from '../controllers/product.controller.js';
import { asyncHandler } from '../middlewares/async-handler.middleware.js';

export const productRouter = Router();

productRouter.get(
  '/',
  asyncHandler((req, res) => productController.getProducts(req, res)),
);

productRouter.get(
  '/:id',
  asyncHandler((req, res) => productController.getProductById(req, res)),
);
