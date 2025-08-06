import express, { Request, Response } from 'express';
import { memoryStore } from '../services/MemoryStore.js';

const router = express.Router();

/**
 * 获取当前购物车状态
 * GET /api/cart
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const cartState = memoryStore.getCartState();
    res.json({
      success: true,
      data: {
        cart: cartState.items,
        totalPrice: cartState.totalPrice,
        totalItems: cartState.totalItems,
        lastModified: cartState.lastModifiedAt,
        lastModifiedBy: cartState.lastModifiedBy
      }
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

/**
 * 获取操作日志
 * GET /api/cart/logs
 */
router.get('/logs', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const logs = memoryStore.getRecentLogs(limit);
    res.json({
      success: true,
      data: {
        logs
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch logs'
    });
  }
});

export default router;