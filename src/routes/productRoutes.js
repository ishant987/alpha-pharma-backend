import express from 'express';
import { getAllProducts, getProductById } from '../controllers/productController.js';

const router = express.Router();

/**
 * Route: /api/v1/products
 */
router.route('/').get(getAllProducts);

/**
 * Route: /api/v1/products/:id
 */
router.route('/:id').get(getProductById);

export default router;
