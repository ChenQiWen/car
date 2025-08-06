import express, { Request, Response } from 'express';
import { memoryStore } from '../services/MemoryStore.js';

const router = express.Router();

/**
 * 获取所有商品
 * GET /api/products
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const products = memoryStore.getAllProducts();
    res.json({
      success: true,
      data: {
        products
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

/**
 * 获取单个商品
 * GET /api/products/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = memoryStore.getProductById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        product
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

export default router;