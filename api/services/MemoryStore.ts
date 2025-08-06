import { Product, CartItem, CartState, User, OperationLog } from '../../shared/types.js';

/**
 * 内存数据存储类
 * 用于演示目的，实际项目中应使用数据库
 */
export class MemoryStore {
  // 商品数据
  private products: Map<string, Product> = new Map();
  
  // 购物车状态 (全局共享)
  private cartState: CartState = {
    items: [],
    totalPrice: 0,
    totalItems: 0,
    lastModifiedBy: '',
    lastModifiedAt: Date.now()
  };
  
  // 在线用户
  private onlineUsers: Map<string, User> = new Map();
  
  // 操作日志
  private operationLogs: OperationLog[] = [];

  constructor() {
    this.initializeProducts();
  }

  /**
   * 初始化商品数据
   */
  private initializeProducts(): void {
    const initialProducts: Product[] = [
      {
        id: 'p1',
        name: 'iPhone 15 Pro',
        price: 7999,
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20smartphone%20with%20titanium%20design%2C%20modern%20sleek%20appearance%2C%20product%20photography%20style&image_size=square',
        description: '最新款iPhone，支持钛金属机身'
      },
      {
        id: 'p2',
        name: 'MacBook Air M3',
        price: 8999,
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=MacBook%20Air%20M3%20laptop%20computer%2C%20thin%20and%20lightweight%20design%2C%20silver%20color%2C%20product%20photography&image_size=square',
        description: '轻薄便携，性能强劲的笔记本电脑'
      },
      {
        id: 'p3',
        name: 'AirPods Pro',
        price: 1999,
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=AirPods%20Pro%20wireless%20earbuds%2C%20white%20color%2C%20charging%20case%2C%20premium%20audio%20product&image_size=square',
        description: '主动降噪无线耳机'
      },
      {
        id: 'p4',
        name: 'iPad Pro 12.9',
        price: 6999,
        image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=iPad%20Pro%2012.9%20inch%20tablet%2C%20large%20screen%2C%20professional%20design%2C%20space%20gray%20color&image_size=square',
        description: '专业级平板电脑，支持Apple Pencil'
      }
    ];

    initialProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // 商品相关方法
  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  // 购物车相关方法
  getCartState(): CartState {
    return { ...this.cartState };
  }

  addToCart(productId: string, quantity: number, userId: string): CartState {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItemIndex = this.cartState.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // 更新现有商品数量
      this.cartState.items[existingItemIndex].quantity += quantity;
      this.cartState.items[existingItemIndex].subtotal = 
        this.cartState.items[existingItemIndex].quantity * product.price;
    } else {
      // 添加新商品
      const newItem: CartItem = {
        productId,
        product,
        quantity,
        subtotal: quantity * product.price
      };
      this.cartState.items.push(newItem);
    }

    this.updateCartTotals();
    this.cartState.lastModifiedBy = userId;
    this.cartState.lastModifiedAt = Date.now();

    this.logOperation(userId, 'add', productId, product.name);
    
    return { ...this.cartState };
  }

  updateQuantity(productId: string, quantity: number, userId: string): CartState {
    const itemIndex = this.cartState.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      // 数量为0或负数时删除商品
      return this.removeFromCart(productId, userId);
    }

    this.cartState.items[itemIndex].quantity = quantity;
    this.cartState.items[itemIndex].subtotal = quantity * this.cartState.items[itemIndex].product.price;

    this.updateCartTotals();
    this.cartState.lastModifiedBy = userId;
    this.cartState.lastModifiedAt = Date.now();

    this.logOperation(userId, 'update', productId, this.cartState.items[itemIndex].product.name);
    
    return { ...this.cartState };
  }

  removeFromCart(productId: string, userId: string): CartState {
    const itemIndex = this.cartState.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    const removedItem = this.cartState.items[itemIndex];
    this.cartState.items.splice(itemIndex, 1);

    this.updateCartTotals();
    this.cartState.lastModifiedBy = userId;
    this.cartState.lastModifiedAt = Date.now();

    this.logOperation(userId, 'remove', productId, removedItem.product.name);
    
    return { ...this.cartState };
  }

  private updateCartTotals(): void {
    this.cartState.totalItems = this.cartState.items.reduce((total, item) => total + item.quantity, 0);
    this.cartState.totalPrice = this.cartState.items.reduce((total, item) => total + item.subtotal, 0);
  }

  // 用户相关方法
  addUser(user: User): void {
    this.onlineUsers.set(user.id, user);
  }

  removeUser(userId: string): void {
    this.onlineUsers.delete(userId);
  }

  getOnlineUsers(): User[] {
    return Array.from(this.onlineUsers.values());
  }

  getUserBySocketId(socketId: string): User | undefined {
    return Array.from(this.onlineUsers.values()).find(user => user.socketId === socketId);
  }

  // 操作日志相关方法
  private logOperation(userId: string, operation: 'add' | 'update' | 'remove', productId: string, productName: string): void {
    const log: OperationLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      operation,
      productId,
      productName,
      timestamp: Date.now()
    };
    
    this.operationLogs.push(log);
    
    // 保留最近100条日志
    if (this.operationLogs.length > 100) {
      this.operationLogs = this.operationLogs.slice(-100);
    }
  }

  getRecentLogs(limit: number = 10): OperationLog[] {
    return this.operationLogs.slice(-limit).reverse();
  }
}

// 单例实例
export const memoryStore = new MemoryStore();