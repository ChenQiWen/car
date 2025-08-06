import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CartItem, User } from '../../shared/types';

// 简化的用户接口，用于连接
interface SimpleUser {
  id: string;
  username: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  updatedAt: Date;
}

interface SocketState {
  connected: boolean;
  cart: CartState;
  onlineUsers: User[];
  message: string;
  error: string | null;
}

interface UseSocketReturn extends SocketState {
  socket: Socket | null;
  addToCart: (productId: string, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  connectUser: (user: SimpleUser) => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<SocketState>({
    connected: false,
    cart: {
      items: [],
      total: 0,
      updatedAt: new Date()
    },
    onlineUsers: [],
    message: '',
    error: null
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
  const currentUserRef = useRef<{ id: string; username: string } | null>(null);
  
  // 同步currentUser状态到ref
  useEffect(() => {
    currentUserRef.current = currentUser;
    console.log('useSocket: currentUser state updated, syncing to ref:', currentUser);
  }, [currentUser]);
  const connectingRef = useRef(false);
  const connectedUserRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('useSocket: Initializing socket connection');
    // 创建Socket连接
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    socketRef.current = socket;

    // 连接事件
    socket.on('connect', () => {
      console.log('Connected to server');
      setState(prev => ({ ...prev, connected: true, error: null }));
    });

    socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      setState(prev => ({ ...prev, connected: false }));
      // 重置连接状态
      connectingRef.current = false;
      connectedUserRef.current = null;
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      connectingRef.current = false;
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    // 购物车更新事件
    socket.on('CART_UPDATED', (data: { cart: CartState; lastModifiedBy: string; timestamp: number }) => {
      console.log('=== CART_UPDATED Event Received ===');
      console.log('CART_UPDATED: Raw data received:', data);
      console.log('CART_UPDATED: Current user:', currentUser);
      console.log('CART_UPDATED: Socket ID:', socket.id);
      console.log('CART_UPDATED: Timestamp:', new Date().toISOString());
      
      // 确保cart对象结构完整
      const safeCart: CartState = {
        items: Array.isArray(data.cart?.items) ? data.cart.items : [],
        total: typeof data.cart?.total === 'number' ? data.cart.total : 0,
        updatedAt: data.cart?.updatedAt ? new Date(data.cart.updatedAt) : new Date()
      };
      
      console.log('CART_UPDATED: Safe cart structure:', safeCart);
      console.log('CART_UPDATED: Items count:', safeCart.items.length);
      console.log('CART_UPDATED: Total amount:', safeCart.total);
      console.log('CART_UPDATED: Last modified by:', data.lastModifiedBy);
      
      setState(prev => {
        console.log('CART_UPDATED: Previous state cart:', prev.cart);
        const newState = { ...prev, cart: safeCart };
        console.log('CART_UPDATED: New state cart:', newState.cart);
        return newState;
      });
      
      console.log('=== CART_UPDATED Event Processing Complete ===');
    });

    // 用户状态更新事件
    socket.on('USER_STATUS_UPDATE', (data: { onlineUsers: User[]; totalCount: number }) => {
      console.log('User status updated:', data);
      setState(prev => ({ ...prev, onlineUsers: data.onlineUsers }));
    });

    // 操作通知事件
    socket.on('OPERATION_NOTIFY', (data: { message: string; userId: string; operation: string; productName: string }) => {
      console.log('Operation notify:', data);
      setState(prev => ({ ...prev, message: data.message }));
      
      // 3秒后清除消息
      setTimeout(() => {
        setState(prev => ({ ...prev, message: '' }));
      }, 3000);
    });

    // 错误事件
    socket.on('error', (data: { message: string }) => {
      console.error('Socket error:', data);
      setState(prev => ({ ...prev, error: data.message }));
      
      // 5秒后清除错误
      setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 连接用户 - 修复无限循环和重复连接问题
  const connectUser = useCallback((user: SimpleUser) => {
    console.log('=== connectUser Function Called ===');
    console.log('connectUser: Called with user:', user);
    console.log('connectUser: Socket ref exists:', !!socketRef.current);
    console.log('connectUser: Socket connected:', socketRef.current?.connected);
    console.log('connectUser: Socket id:', socketRef.current?.id);
    console.log('connectUser: Current user state before:', currentUser);
    console.log('connectUser: connectingRef.current:', connectingRef.current);
    console.log('connectUser: connectedUserRef.current:', connectedUserRef.current);
    
    // 检查是否正在连接中
    if (connectingRef.current) {
      console.log('connectUser: Already connecting, skipping...');
      return;
    }
    
    // 检查是否已经连接了相同用户
    if (connectedUserRef.current === user.id) {
      console.log('connectUser: User already connected, skipping...');
      return;
    }
    
    if (!socketRef.current) {
      console.error('connectUser: Socket not initialized');
      return;
    }
    
    if (!user || !user.id || !user.username) {
      console.error('connectUser: Invalid user data:', user);
      return;
    }
    
    // 设置连接中状态
    connectingRef.current = true;
    
    // 先设置用户状态 - 同时更新state和ref以确保立即可用
    const userData = { id: user.id, username: user.username };
    console.log('connectUser: Setting currentUser to:', userData);
    setCurrentUser(userData);
    // 立即更新ref，确保addToCart可以立即使用
    currentUserRef.current = userData;
    
    const performConnection = () => {
      if (!socketRef.current || !socketRef.current.connected) {
        console.warn('connectUser: Socket not connected when trying to emit');
        connectingRef.current = false;
        return;
      }
      
      const emitData = {
        userId: user.id,
        username: user.username
      };
      console.log('connectUser: Emitting USER_CONNECT with data:', emitData);
      
      try {
        socketRef.current.emit('USER_CONNECT', emitData);
        connectedUserRef.current = user.id;
        console.log(`connectUser: Successfully connected user: ${user.username} (${user.id})`);
      } catch (error) {
        console.error('connectUser: Error emitting USER_CONNECT:', error);
      } finally {
        connectingRef.current = false;
      }
    };
    
    // 如果socket未连接，等待连接后再发送
    if (!socketRef.current.connected) {
      console.warn('connectUser: Socket not connected, waiting for connection...');
      connectingRef.current = false; // 重置连接状态
      return;
    } else {
      // Socket已连接，直接发送
      performConnection();
    }
    
    console.log('=== connectUser Function End ===');
  }, []);

  // 添加商品到购物车
  const addToCart = useCallback((productId: string, quantity: number) => {
    console.log('=== addToCart Function Called ===');
    console.log('addToCart: Input parameters:', { productId, quantity });
    console.log('addToCart: Current user state:', currentUser);
    console.log('addToCart: Current user ID:', currentUser?.id);
    console.log('addToCart: Current user username:', currentUser?.username);
    console.log('addToCart: Socket ref exists:', !!socketRef.current);
    console.log('addToCart: Socket connected:', socketRef.current?.connected);
    console.log('addToCart: Socket id:', socketRef.current?.id);
    console.log('addToCart: Socket transport:', socketRef.current?.io?.engine?.transport?.name);
    console.log('addToCart: Socket readyState:', socketRef.current?.io?.engine?.readyState);
    console.log('addToCart: Current cart state:', state.cart);
    console.log('addToCart: Current cart items count:', state.cart?.items?.length || 0);
    console.log('addToCart: Connected users ref:', connectedUserRef.current);
    console.log('addToCart: Connecting ref:', connectingRef.current);
    console.log('addToCart: Timestamp:', new Date().toISOString());
    
    // 检查Socket初始化
    if (!socketRef.current) {
      console.error('addToCart: FAILED - Socket not initialized');
      setState(prev => ({ ...prev, error: 'WebSocket连接未初始化' }));
      return;
    }
    
    // 检查Socket连接状态
    if (!socketRef.current.connected) {
      console.error('addToCart: FAILED - Socket not connected');
      setState(prev => ({ ...prev, error: 'WebSocket未连接，请等待连接建立' }));
      return;
    }
    
    // 检查用户状态 - 优先使用ref中的用户信息，因为它是立即更新的
    const userToUse = currentUserRef.current || currentUser;
    if (!userToUse) {
      console.error('addToCart: FAILED - Current user not set');
      setState(prev => ({ ...prev, error: '用户信息未设置，请刷新页面重试' }));
      return;
    }
    
    // 检查用户ID
    if (!userToUse.id) {
      console.error('addToCart: FAILED - Current user ID is missing:', userToUse);
      setState(prev => ({ ...prev, error: '用户ID缺失，请刷新页面重试' }));
      return;
    }
    
    // 检查产品ID
    if (!productId) {
      console.error('addToCart: FAILED - Product ID is missing');
      setState(prev => ({ ...prev, error: '商品ID缺失' }));
      return;
    }
    
    // 检查数量
    if (!quantity || quantity <= 0) {
      console.error('addToCart: FAILED - Invalid quantity:', quantity);
      setState(prev => ({ ...prev, error: '商品数量无效' }));
      return;
    }
    
    const emitData = {
      productId,
      quantity,
      userId: userToUse.id
    };
    
    console.log('addToCart: All checks passed, emitting ADD_TO_CART with data:', emitData);
    
    try {
      // 添加事件发送前的状态检查
      if (!socketRef.current.connected) {
        console.error('addToCart: Socket disconnected just before emit');
        setState(prev => ({ ...prev, error: 'WebSocket连接已断开' }));
        return;
      }
      
      socketRef.current.emit('ADD_TO_CART', emitData);
      console.log('addToCart: SUCCESS - Event emitted successfully');
      console.log('addToCart: Waiting for server response...');
      
      // 清除之前的错误
      setState(prev => ({ ...prev, error: null }));
      
      // 添加超时检测
      const timeoutId = setTimeout(() => {
        console.warn('addToCart: No response from server after 5 seconds');
      }, 5000);
      
      // 清除超时
      const originalCartUpdated = socketRef.current.listeners('CART_UPDATED');
      const onceHandler = () => {
        clearTimeout(timeoutId);
        console.log('addToCart: Received CART_UPDATED response');
      };
      socketRef.current.once('CART_UPDATED', onceHandler);
      
    } catch (error) {
      console.error('addToCart: FAILED - Error emitting event:', error);
      console.error('addToCart: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      setState(prev => ({ ...prev, error: '添加商品到购物车失败: ' + (error instanceof Error ? error.message : String(error)) }));
    }
    
    console.log('=== addToCart Function End ===');
  }, [currentUser]);

  // 更新商品数量
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const userToUse = currentUserRef.current || currentUser;
    if (socketRef.current && socketRef.current.connected && userToUse) {
      socketRef.current.emit('UPDATE_QUANTITY', {
        productId,
        quantity,
        userId: userToUse.id
      });
      console.log(`Updating quantity: ${productId}, quantity: ${quantity}`);
    } else {
      console.warn('Socket not connected or user not set');
    }
  }, [currentUser]);

  // 从购物车删除商品
  const removeFromCart = useCallback((productId: string) => {
    const userToUse = currentUserRef.current || currentUser;
    if (socketRef.current && socketRef.current.connected && userToUse) {
      socketRef.current.emit('REMOVE_FROM_CART', {
        productId,
        userId: userToUse.id
      });
      console.log(`Removing from cart: ${productId}`);
    } else {
      console.warn('Socket not connected or user not set');
    }
  }, [currentUser]);

  return {
    ...state,
    socket: socketRef.current,
    addToCart,
    updateQuantity,
    removeFromCart,
    connectUser
  };
}