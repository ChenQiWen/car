import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { ProductGrid } from '../components/ProductGrid';
import { CartSidebar } from '../components/CartSidebar';
import { OnlineUsers } from '../components/OnlineUsers';
import { NotificationManager } from '../components/NotificationToast';
import { useSocket } from '../hooks/useSocket';
import { useUser } from '../hooks/useUser';
import { UserSetup } from '../components/UserSetup';

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user, setUser, clearUser, regenerateUser } = useUser();
  
  const {
    cart,
    onlineUsers,
    connected,
    message,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    connectUser
  } = useSocket();

  // 连接用户 - 修复无限循环问题
  const userConnectedRef = useRef(false);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    console.log('=== Home useEffect for user connection ===');
    console.log('Home: user state:', user);
    console.log('Home: userConnectedRef.current:', userConnectedRef.current);
    console.log('Home: connected:', connected);
    
    // 清除之前的超时
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    
    if (user && !userConnectedRef.current && connected) {
      console.log('Home: User exists, not connected yet, and socket is connected. Scheduling connection...');
      
      // 延迟连接，防止频繁调用
      connectionTimeoutRef.current = setTimeout(() => {
        if (user.id && user.username && connected && !userConnectedRef.current) {
          console.log('Home: Calling connectUser with valid user data');
          connectUser(user);
          userConnectedRef.current = true;
        }
      }, 100); // 减少到100ms延迟，确保快速连接
      
    } else if (!user) {
      console.log('Home: No user data available, resetting connection flag');
      userConnectedRef.current = false;
    } else if (!connected) {
      console.log('Home: Socket not connected, waiting...');
      userConnectedRef.current = false;
    } else {
      console.log('Home: User already connected or conditions not met');
    }
    
    console.log('=== Home useEffect end ===');
    
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    };
  }, [user, connected]); // 添加connected依赖但使用延迟机制

  // 计算购物车商品总数 - 提供安全的默认值和防御性编程
  const safeCart = cart || { items: [], total: 0, updatedAt: new Date() };
  console.log('=== Home Component Cart State Debug ===');
  console.log('Home: Raw cart from useSocket:', cart);
  console.log('Home: Safe cart:', safeCart);
  console.log('Home: Safe cart items:', safeCart.items);
  console.log('Home: Safe cart items length:', safeCart.items?.length);
  
  const safeItems = Array.isArray(safeCart.items) ? safeCart.items : [];
  const cartItemsCount = safeItems.reduce((total, item) => {
    const quantity = typeof item?.quantity === 'number' ? item.quantity : 0;
    console.log('Home: Processing cart item:', item, 'quantity:', quantity);
    return total + quantity;
  }, 0);
  
  console.log('Home: Final cart items count:', cartItemsCount);
  console.log('Home: User state:', user);
  console.log('Home: Connected state:', connected);
  console.log('=== Home Component Cart State Debug End ===');

  // 处理用户设置
  const handleUserSet = (newUser: { id: string; username: string }) => {
    setUser(newUser);
  };

  const handleClearStorage = () => {
    clearUser();
  };

  // 如果用户信息未设置，显示用户设置界面
  if (!user) {
    return (
      <UserSetup 
        onUserSet={handleUserSet}
        onClearStorage={handleClearStorage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                实时购物车
              </h1>
            </div>

            {/* 右侧操作区 */}
            <div className="flex items-center gap-4">
              {/* 连接状态 */}
              <div className="hidden sm:flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-sm text-gray-600">
                  {connected ? '已连接' : '连接中...'}
                </span>
              </div>

              {/* 调试按钮 */}
              <button
                onClick={regenerateUser}
                className="hidden sm:block px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                title="重新生成用户（调试用）"
              >
                重置用户
              </button>

              {/* 购物车按钮 */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemsCount > 99 ? '99+' : cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 商品展示区域 */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                商品列表
              </h2>
              <p className="text-gray-600">
                选择您喜欢的商品，实时同步到所有用户
              </p>
            </div>
            
            <ProductGrid onAddToCart={addToCart} />
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* 在线用户 */}
              <OnlineUsers 
                users={onlineUsers} 
                connected={connected}
                currentUserId={user?.id}
              />

              {/* 购物车摘要 (桌面端) */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">购物车</h3>
                    <button
                      onClick={() => setIsCartOpen(true)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      查看详情
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">商品数量:</span>
                      <span className="font-medium">{cartItemsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">总金额:</span>
                      <span className="font-medium text-blue-600">
                        ¥{(typeof safeCart.total === 'number' ? safeCart.total : 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {cartItemsCount === 0 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      购物车为空
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 购物车侧边栏 */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={safeCart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        disabled={!connected}
      />

      {/* 通知管理器 */}
      <NotificationManager message={message} error={error} />
    </div>
  );
}