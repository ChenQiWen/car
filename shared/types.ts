// 共享类型定义文件

// 商品接口
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

// 购物车商品接口
export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

// 用户接口
export interface User {
  id: string;
  username: string;
  socketId: string;
  connectedAt: number;
}

// 购物车状态接口
export interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  lastModifiedBy: string;
  lastModifiedAt: number;
}

// 操作日志接口
export interface OperationLog {
  id: string;
  userId: string;
  operation: 'add' | 'update' | 'remove';
  productId: string;
  productName: string;
  timestamp: number;
  details?: any;
}

// WebSocket事件类型定义

// 客户端发送事件
export interface AddToCartEvent {
  type: 'ADD_TO_CART';
  payload: {
    productId: string;
    quantity: number;
    userId: string;
  };
}

export interface UpdateQuantityEvent {
  type: 'UPDATE_QUANTITY';
  payload: {
    productId: string;
    quantity: number;
    userId: string;
  };
}

export interface RemoveFromCartEvent {
  type: 'REMOVE_FROM_CART';
  payload: {
    productId: string;
    userId: string;
  };
}

export interface UserConnectEvent {
  type: 'USER_CONNECT';
  payload: {
    userId: string;
    username: string;
  };
}

// 服务端广播事件
export interface CartUpdateEvent {
  type: 'CART_UPDATED';
  payload: {
    cart: CartItem[];
    lastModifiedBy: string;
    timestamp: number;
  };
}

export interface UserStatusEvent {
  type: 'USER_STATUS_UPDATE';
  payload: {
    onlineUsers: User[];
    totalCount: number;
  };
}

export interface OperationNotifyEvent {
  type: 'OPERATION_NOTIFY';
  payload: {
    message: string;
    userId: string;
    operation: 'add' | 'update' | 'remove';
    productName: string;
  };
}

// 联合类型
export type ClientEvent = AddToCartEvent | UpdateQuantityEvent | RemoveFromCartEvent | UserConnectEvent;
export type ServerEvent = CartUpdateEvent | UserStatusEvent | OperationNotifyEvent;