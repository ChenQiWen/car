import React, { useState } from 'react';
import { ShoppingCart, X, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '../../shared/types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart?: {
    items: CartItem[];
    total: number;
    updatedAt: Date;
  };
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  disabled?: boolean;
}

export function CartSidebar({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQuantity, 
  onRemoveItem,
  disabled = false 
}: CartSidebarProps) {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // 调试日志
  console.log('=== CartSidebar Component Debug ===');
  console.log('CartSidebar: isOpen:', isOpen);
  console.log('CartSidebar: cart prop:', JSON.stringify(cart, null, 2));
  console.log('CartSidebar: cart type:', typeof cart);
  console.log('CartSidebar: cart items:', cart?.items);
  console.log('CartSidebar: cart items length:', cart?.items?.length);
  console.log('CartSidebar: cart total:', cart?.total);
  
  // 提供默认值以防cart为undefined
  const safeCart = cart || { items: [], total: 0, updatedAt: new Date() };
  const cartItems = safeCart.items;
  const totalPrice = safeCart.total;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  console.log('CartSidebar: safeCart:', JSON.stringify(safeCart, null, 2));
  console.log('CartSidebar: cartItems:', cartItems);
  console.log('CartSidebar: cartItems length:', cartItems.length);
  console.log('CartSidebar: totalPrice:', totalPrice);
  console.log('CartSidebar: totalItems:', totalItems);
  console.log('=== CartSidebar Component Debug End ===');

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (disabled || updatingItems.has(productId)) return;
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    
    try {
      onUpdateQuantity(productId, newQuantity);
    } finally {
      // 延迟移除loading状态，给用户反馈
      setTimeout(() => {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 300);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (disabled || updatingItems.has(productId)) return;
    
    setUpdatingItems(prev => new Set(prev).add(productId));
    
    try {
      onRemoveItem(productId);
    } finally {
      setTimeout(() => {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }, 300);
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* 侧边栏 */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">购物车</h2>
            {totalItems > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 购物车内容 */}
        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">购物车为空</h3>
              <p className="text-gray-500 text-center">添加一些商品到购物车吧！</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => {
                const isUpdating = updatingItems.has(item.productId);
                
                return (
                  <div 
                    key={item.productId} 
                    className={`bg-gray-50 rounded-lg p-4 transition-opacity ${
                      isUpdating ? 'opacity-50' : 'opacity-100'
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* 商品图片 */}
                      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* 商品信息 */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          ¥{item.product.price.toLocaleString()}
                        </p>
                        
                        {/* 数量控制 */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                              disabled={disabled || isUpdating || item.quantity <= 1}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                              disabled={disabled || isUpdating}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={disabled || isUpdating}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* 小计 */}
                        <div className="text-right mt-2">
                          <span className="font-semibold text-blue-600">
                            ¥{item.subtotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部总计 */}
        {cartItems.length > 0 && (
          <div className="border-t p-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">总计:</span>
              <span className="text-xl font-bold text-blue-600">
                ¥{totalPrice.toLocaleString()}
              </span>
            </div>
            
            <button 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              disabled={disabled}
            >
              去结算 ({totalItems}件商品)
            </button>
          </div>
        )}
      </div>
    </>
  );
}