import React from 'react';
import { useSocket } from '../hooks/useSocket';

export function CartDebugPanel() {
  const { cart, connected, addToCart } = useSocket();

  const handleTestAdd = () => {
    console.log('=== Test Add to Cart ===');
    addToCart('1', 1); // 添加第一个产品
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <h3 className="text-lg font-bold text-red-600 mb-2">购物车调试面板</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>连接状态:</strong> {connected ? '已连接' : '未连接'}
        </div>
        
        <div>
          <strong>购物车商品数:</strong> {cart?.items?.length || 0}
        </div>
        
        <div>
          <strong>购物车总价:</strong> ¥{cart?.total?.toFixed(2) || '0.00'}
        </div>
        
        <div>
          <strong>最后更新:</strong> {cart?.updatedAt?.toLocaleTimeString() || '未知'}
        </div>
        
        <div className="mt-3">
          <button
            onClick={handleTestAdd}
            disabled={!connected}
            className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            测试添加商品
          </button>
        </div>
        
        <div className="mt-2">
          <strong>购物车详情:</strong>
          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
            {JSON.stringify(cart, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}