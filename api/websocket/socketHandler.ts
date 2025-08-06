import { Server, Socket } from 'socket.io';
import { memoryStore } from '../services/MemoryStore.js';
import { User, ClientEvent, ServerEvent } from '../../shared/types.js';

/**
 * 设置WebSocket事件处理
 */
export function setupWebSocket(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // 处理用户连接
    socket.on('USER_CONNECT', (data: { userId: string; username: string }) => {
      try {
        const user: User = {
          id: data.userId,
          username: data.username,
          socketId: socket.id,
          connectedAt: Date.now()
        };

        memoryStore.addUser(user);
        
        // 广播用户状态更新
        const onlineUsers = memoryStore.getOnlineUsers();
        io.emit('USER_STATUS_UPDATE', {
          onlineUsers,
          totalCount: onlineUsers.length
        });

        // 发送当前购物车状态给新连接的用户
        const cartState = memoryStore.getCartState();
        socket.emit('CART_UPDATED', {
          cart: cartState.items,
          lastModifiedBy: cartState.lastModifiedBy,
          timestamp: cartState.lastModifiedAt
        });

        console.log(`User ${data.username} (${data.userId}) connected`);
      } catch (error) {
        console.error('Error handling user connect:', error);
        socket.emit('error', { message: 'Failed to connect user' });
      }
    });

    // 处理添加商品到购物车
    socket.on('ADD_TO_CART', (data: { productId: string; quantity: number; userId: string }) => {
      try {
        const cartState = memoryStore.addToCart(data.productId, data.quantity, data.userId);
        const user = memoryStore.getUserBySocketId(socket.id);
        const product = memoryStore.getProductById(data.productId);

        // 广播购物车更新
        io.emit('CART_UPDATED', {
          cart: cartState.items,
          lastModifiedBy: cartState.lastModifiedBy,
          timestamp: cartState.lastModifiedAt
        });

        // 广播操作通知
        if (user && product) {
          io.emit('OPERATION_NOTIFY', {
            message: `${user.username} 添加了 ${product.name} 到购物车`,
            userId: data.userId,
            operation: 'add' as const,
            productName: product.name
          });
        }

        console.log(`User ${data.userId} added product ${data.productId} to cart`);
      } catch (error) {
        console.error('Error adding to cart:', error);
        socket.emit('error', { message: 'Failed to add item to cart' });
      }
    });

    // 处理更新商品数量
    socket.on('UPDATE_QUANTITY', (data: { productId: string; quantity: number; userId: string }) => {
      try {
        const cartState = memoryStore.updateQuantity(data.productId, data.quantity, data.userId);
        const user = memoryStore.getUserBySocketId(socket.id);
        const product = memoryStore.getProductById(data.productId);

        // 广播购物车更新
        io.emit('CART_UPDATED', {
          cart: cartState.items,
          lastModifiedBy: cartState.lastModifiedBy,
          timestamp: cartState.lastModifiedAt
        });

        // 广播操作通知
        if (user && product) {
          io.emit('OPERATION_NOTIFY', {
            message: `${user.username} 更新了 ${product.name} 的数量为 ${data.quantity}`,
            userId: data.userId,
            operation: 'update' as const,
            productName: product.name
          });
        }

        console.log(`User ${data.userId} updated product ${data.productId} quantity to ${data.quantity}`);
      } catch (error) {
        console.error('Error updating quantity:', error);
        socket.emit('error', { message: 'Failed to update item quantity' });
      }
    });

    // 处理删除商品
    socket.on('REMOVE_FROM_CART', (data: { productId: string; userId: string }) => {
      try {
        const product = memoryStore.getProductById(data.productId);
        const cartState = memoryStore.removeFromCart(data.productId, data.userId);
        const user = memoryStore.getUserBySocketId(socket.id);

        // 广播购物车更新
        io.emit('CART_UPDATED', {
          cart: cartState.items,
          lastModifiedBy: cartState.lastModifiedBy,
          timestamp: cartState.lastModifiedAt
        });

        // 广播操作通知
        if (user && product) {
          io.emit('OPERATION_NOTIFY', {
            message: `${user.username} 从购物车中删除了 ${product.name}`,
            userId: data.userId,
            operation: 'remove' as const,
            productName: product.name
          });
        }

        console.log(`User ${data.userId} removed product ${data.productId} from cart`);
      } catch (error) {
        console.error('Error removing from cart:', error);
        socket.emit('error', { message: 'Failed to remove item from cart' });
      }
    });

    // 处理用户断开连接
    socket.on('disconnect', () => {
      try {
        const user = memoryStore.getUserBySocketId(socket.id);
        if (user) {
          memoryStore.removeUser(user.id);
          
          // 广播用户状态更新
          const onlineUsers = memoryStore.getOnlineUsers();
          io.emit('USER_STATUS_UPDATE', {
            onlineUsers,
            totalCount: onlineUsers.length
          });

          console.log(`User ${user.username} (${user.id}) disconnected`);
        }
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // 处理错误
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('WebSocket handlers set up successfully');
}