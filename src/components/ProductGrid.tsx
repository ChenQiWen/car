import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { Product } from '../../shared/types';
import { useProducts } from '../hooks/useProducts';

interface ProductGridProps {
  onAddToCart: (productId: string, quantity: number) => void;
}

export function ProductGrid({ onAddToCart }: ProductGridProps) {
  const { products, loading, error } = useProducts();
  // 加载状态
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">正在加载商品...</p>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">加载失败</h3>
        <p className="text-gray-600 mb-4 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={16} />
          重试
        </button>
      </div>
    );
  }

  // 空状态
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📦</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无商品</h3>
        <p className="text-gray-600">目前没有可用的商品</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}